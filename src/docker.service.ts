import { Injectable, Logger } from '@nestjs/common';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';
import * as path from 'path';

const execAsync = promisify(exec);

export interface ImagePullResult {
  image: string;
  success: boolean;
  error?: string;
}

export interface ImageSaveResult {
  image: string;
  filename: string;
  success: boolean;
  error?: string;
}

export interface OfflineExportResult {
  totalImages: number;
  pulledImages: number;
  savedImages: number;
  failedPulls: string[];
  failedSaves: string[];
  outputDirectory: string;
}

@Injectable()
export class DockerService {
  private readonly logger = new Logger(DockerService.name);

  /**
   * Check if Docker is available
   */
  async checkDockerAvailable(): Promise<boolean> {
    try {
      await execAsync('docker --version');
      return true;
    } catch (error) {
      this.logger.error('Docker is not available', error.message);
      return false;
    }
  }

  /**
   * Pull a single Docker image with detailed progress
   */
  async pullImage(
    image: string,
    showProgress: boolean = false,
  ): Promise<ImagePullResult> {
    try {
      this.logger.log(`Pulling image: ${image}`);

      if (showProgress) {
        // Use spawn for real-time output
        const { spawn } = require('child_process');

        return new Promise((resolve) => {
          const dockerPull = spawn('docker', ['pull', image]);

          dockerPull.stdout.on('data', (data: Buffer) => {
            const output = data.toString().trim();
            if (output) {
              // Log each line of Docker pull output
              output.split('\n').forEach((line) => {
                if (line.trim()) {
                  this.logger.log(`  ${line}`);
                }
              });
            }
          });

          dockerPull.stderr.on('data', (data: Buffer) => {
            const output = data.toString().trim();
            if (output && !output.includes('Pull complete')) {
              this.logger.warn(`  ${output}`);
            }
          });

          dockerPull.on('close', (code: number) => {
            if (code === 0) {
              this.logger.log(`✓ Successfully pulled: ${image}`);
              resolve({ image, success: true });
            } else {
              this.logger.error(`✗ Failed to pull ${image} (exit code: ${code})`);
              resolve({ image, success: false, error: `Exit code: ${code}` });
            }
          });

          dockerPull.on('error', (error: Error) => {
            this.logger.error(`✗ Failed to pull ${image}: ${error.message}`);
            resolve({ image, success: false, error: error.message });
          });
        });
      } else {
        // Original quick mode without detailed output
        const { stdout, stderr } = await execAsync(`docker pull ${image}`);

        if (stderr && !stderr.includes('Pull complete')) {
          this.logger.warn(`Pull stderr for ${image}: ${stderr}`);
        }

        this.logger.log(`Successfully pulled: ${image}`);
        return { image, success: true };
      }
    } catch (error) {
      this.logger.error(`Failed to pull ${image}`, error.message);
      return { image, success: false, error: error.message };
    }
  }

  /**
   * Pull multiple Docker images
   */
  async pullImages(
    images: string[],
    showProgress: boolean = false,
  ): Promise<ImagePullResult[]> {
    this.logger.log(`Pulling ${images.length} images...`);
    const results: ImagePullResult[] = [];

    for (let i = 0; i < images.length; i++) {
      const image = images[i];
      if (showProgress) {
        this.logger.log(`\n[${i + 1}/${images.length}] Processing: ${image}`);
      }
      const result = await this.pullImage(image, showProgress);
      results.push(result);
    }

    const successful = results.filter((r) => r.success).length;
    this.logger.log(
      `\nPull completed: ${successful}/${images.length} successful`,
    );

    return results;
  }

  /**
   * Save a Docker image to a tar.gz file with detailed progress
   */
  async saveImage(
    image: string,
    outputDir: string,
    showProgress: boolean = false,
  ): Promise<ImageSaveResult> {
    try {
      // Create output directory if it doesn't exist
      await fs.mkdir(outputDir, { recursive: true });

      // Generate filename from image name
      const sanitizedName = image.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filename = `${sanitizedName}.tar.gz`;
      const filepath = path.join(outputDir, filename);

      this.logger.log(`Saving image ${image}...`);
      if (showProgress) {
        this.logger.log(`  Output: ${filepath}`);
        this.logger.log(`  Running: docker save ${image} | gzip > file`);
      }

      // Use docker save and pipe to gzip
      const startTime = Date.now();
      await execAsync(`docker save ${image} | gzip > "${filepath}"`);
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);

      // Get file size
      const stats = await fs.stat(filepath);
      const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);

      if (showProgress) {
        this.logger.log(
          `  ✓ Saved: ${filename} (${sizeMB} MB in ${duration}s)`,
        );
      } else {
        this.logger.log(`Successfully saved: ${filename} (${sizeMB} MB)`);
      }

      return { image, filename, success: true };
    } catch (error) {
      this.logger.error(`Failed to save ${image}`, error.message);
      return { image, filename: '', success: false, error: error.message };
    }
  }

  /**
   * Save multiple Docker images to tar.gz files
   */
  async saveImages(
    images: string[],
    outputDir: string,
    showProgress: boolean = false,
  ): Promise<ImageSaveResult[]> {
    this.logger.log(`Saving ${images.length} images to ${outputDir}...`);
    const results: ImageSaveResult[] = [];

    for (let i = 0; i < images.length; i++) {
      const image = images[i];
      if (showProgress) {
        this.logger.log(`\n[${i + 1}/${images.length}] ${image}`);
      }
      const result = await this.saveImage(image, outputDir, showProgress);
      results.push(result);
    }

    const successful = results.filter((r) => r.success).length;
    const totalSize = results
      .filter((r) => r.success)
      .reduce((acc, r) => acc, 0);

    this.logger.log(
      `\nSave completed: ${successful}/${images.length} successful`,
    );

    return results;
  }

  /**
   * Complete offline export workflow: pull and save images
   */
  async offlineExport(
    images: string[],
    outputDir: string = './k8s-images-offline',
    showProgress: boolean = true,
  ): Promise<OfflineExportResult> {
    this.logger.log(
      `Starting offline export for ${images.length} images to ${outputDir}`,
    );

    // Check Docker availability
    const dockerAvailable = await this.checkDockerAvailable();
    if (!dockerAvailable) {
      throw new Error(
        'Docker is not available. Please ensure Docker is installed and running.',
      );
    }

    // Pull images with detailed progress
    const pullResults = await this.pullImages(images, showProgress);
    const successfulPulls = pullResults.filter((r) => r.success);
    const failedPulls = pullResults
      .filter((r) => !r.success)
      .map((r) => r.image);

    // Save successfully pulled images with detailed progress
    const imagesToSave = successfulPulls.map((r) => r.image);
    const saveResults = await this.saveImages(imagesToSave, outputDir, showProgress);
    const failedSaves = saveResults
      .filter((r) => !r.success)
      .map((r) => r.image);

    const result: OfflineExportResult = {
      totalImages: images.length,
      pulledImages: successfulPulls.length,
      savedImages: saveResults.filter((r) => r.success).length,
      failedPulls,
      failedSaves,
      outputDirectory: path.resolve(outputDir),
    };

    this.logger.log(
      `Offline export completed: ${result.savedImages}/${result.totalImages} images saved`,
    );

    return result;
  }

  /**
   * Create a load script for offline images
   */
  async createLoadScript(outputDir: string): Promise<void> {
    const scriptPath = path.join(outputDir, 'load-images.sh');
    const script = `#!/bin/bash
# Script to load all Docker images from tar.gz files

echo "Loading Docker images from ${outputDir}..."

SCRIPT_DIR="$( cd "$( dirname "\${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

loaded=0
failed=0

for file in *.tar.gz; do
  if [ -f "$file" ]; then
    echo "Loading $file..."
    if gunzip -c "$file" | docker load; then
      echo "✓ Successfully loaded $file"
      ((loaded++))
    else
      echo "✗ Failed to load $file"
      ((failed++))
    fi
  fi
done

echo ""
echo "=== Summary ==="
echo "Loaded: $loaded"
echo "Failed: $failed"
echo "Total: $((loaded + failed))"
`;

    await fs.writeFile(scriptPath, script, { mode: 0o755 });
    this.logger.log(`Created load script: ${scriptPath}`);
  }

  /**
   * Create a README for the offline export
   */
  async createOfflineReadme(
    outputDir: string,
    result: OfflineExportResult,
  ): Promise<void> {
    const readmePath = path.join(outputDir, 'README.md');
    const readme = `# Kubernetes Images - Offline Export

This directory contains Docker images exported for offline use.

## Export Information

- **Total Images**: ${result.totalImages}
- **Successfully Pulled**: ${result.pulledImages}
- **Successfully Saved**: ${result.savedImages}
- **Export Date**: ${new Date().toISOString()}

${result.failedPulls.length > 0 ? `\n## Failed Pulls\n\nThe following images failed to pull:\n${result.failedPulls.map((img) => `- ${img}`).join('\n')}\n` : ''}
${result.failedSaves.length > 0 ? `\n## Failed Saves\n\nThe following images failed to save:\n${result.failedSaves.map((img) => `- ${img}`).join('\n')}\n` : ''}

## How to Load Images

### Option 1: Use the provided script (Linux/Mac)

\`\`\`bash
chmod +x load-images.sh
./load-images.sh
\`\`\`

### Option 2: Load manually

Load individual images:

\`\`\`bash
gunzip -c image-name.tar.gz | docker load
\`\`\`

Load all images:

\`\`\`bash
for file in *.tar.gz; do gunzip -c "$file" | docker load; done
\`\`\`

### Option 3: Windows (PowerShell)

\`\`\`powershell
Get-ChildItem -Filter *.tar.gz | ForEach-Object {
    Write-Host "Loading $($_.Name)..."
    & docker load -i $_.FullName
}
\`\`\`

## Files

Each \`.tar.gz\` file contains a complete Docker image that can be loaded with \`docker load\`.

## Verification

After loading, verify images are available:

\`\`\`bash
docker images
\`\`\`
`;

    await fs.writeFile(readmePath, readme, 'utf-8');
    this.logger.log(`Created README: ${readmePath}`);
  }
}
