import { Injectable, Logger } from '@nestjs/common';
import { DockerComposeService } from './docker-compose.service';
import { DockerService, OfflineExportResult } from './docker.service';
import { TrivyService, TrivyScanSummary } from './trivy.service';

export interface ComposeOfflineExportOptions {
  composePath: string;
  outputDir?: string;
  buildIfNeeded?: boolean;
  showProgress?: boolean;
  scanVulnerabilities?: boolean;
}

export interface CompleteComposeOfflineExportResult extends OfflineExportResult {
  imageListFile: string;
  totalServices: number;
  servicesBuilt: number;
  composeFile: string;
  vulnerabilityScan?: TrivyScanSummary;
}

@Injectable()
export class ComposeOfflineExportService {
  private readonly logger = new Logger(ComposeOfflineExportService.name);

  constructor(
    private readonly dockerComposeService: DockerComposeService,
    private readonly dockerService: DockerService,
    private readonly trivyService: TrivyService,
  ) {}

  /**
   * Complete offline export workflow from docker-compose:
   * 1. Parse docker-compose file
   * 2. Optionally build services
   * 3. Extract all images
   * 4. Pull images with Docker
   * 5. Save images as tar.gz files
   * 6. Optionally scan vulnerabilities
   * 7. Create helper scripts and documentation
   */
  async completeOfflineExport(
    options: ComposeOfflineExportOptions,
  ): Promise<CompleteComposeOfflineExportResult> {
    const {
      composePath,
      outputDir = './docker-compose-images-offline',
      buildIfNeeded = false,
      showProgress = true,
      scanVulnerabilities = true,
    } = options;

    this.logger.log('=== Starting Docker Compose Offline Export ===');
    this.logger.log(`Compose File: ${composePath}`);

    // Step 1: Parse and extract images from docker-compose
    const totalSteps = scanVulnerabilities ? 5 : 4;
    this.logger.log(`Step 1/${totalSteps}: Parsing docker-compose file...`);
    const composeExport = await this.dockerComposeService.exportComposeImages({
      composePath,
      filename: 'docker-compose-images.txt',
      buildIfNeeded,
    });

    if (composeExport.totalImages === 0) {
      throw new Error('No images found in docker-compose file');
    }

    this.logger.log(
      `Found ${composeExport.totalImages} images from ${composeExport.totalServices} services`,
    );

    if (composeExport.servicesBuilt > 0) {
      this.logger.log(`Built ${composeExport.servicesBuilt} services`);
    }

    // Step 2-3: Pull and save Docker images with detailed progress
    this.logger.log('\nStep 2/4: Pulling Docker images...');
    this.logger.log('Step 3/4: Saving images to tar.gz files...\n');

    const dockerExport = await this.dockerService.offlineExport(
      composeExport.images,
      outputDir,
      showProgress,
    );

    // Step 4: Scan vulnerabilities if requested
    let vulnerabilityScan: TrivyScanSummary | undefined;
    if (scanVulnerabilities) {
      this.logger.log(`\nStep 4/${totalSteps}: Scanning images for vulnerabilities...\n`);
      vulnerabilityScan = await this.trivyService.performVulnerabilityScan(
        composeExport.images,
        outputDir,
        showProgress,
      );
    }

    // Step 5 (or 4 if no scan): Create helper scripts and documentation
    this.logger.log(`\nStep ${totalSteps}/${totalSteps}: Creating helper scripts and documentation...`);
    await this.dockerService.createLoadScript(outputDir);
    await this.dockerService.createOfflineReadme(outputDir, dockerExport);

    const result: CompleteComposeOfflineExportResult = {
      ...dockerExport,
      imageListFile: 'docker-compose-images.txt',
      totalServices: composeExport.totalServices,
      servicesBuilt: composeExport.servicesBuilt,
      composeFile: composePath,
      vulnerabilityScan,
    };

    this.logger.log('=== Docker Compose Offline Export Complete ===');
    this.logger.log(`Compose File: ${result.composeFile}`);
    this.logger.log(`Output Directory: ${result.outputDirectory}`);
    this.logger.log(`Total Services: ${result.totalServices}`);
    this.logger.log(`Services Built: ${result.servicesBuilt}`);
    this.logger.log(`Unique Images: ${result.totalImages}`);
    this.logger.log(`Successfully Saved: ${result.savedImages}`);
    this.logger.log(`Failed Pulls: ${result.failedPulls.length}`);
    this.logger.log(`Failed Saves: ${result.failedSaves.length}`);

    if (vulnerabilityScan) {
      this.logger.log('\n=== Vulnerability Scan Summary (CRITICAL & HIGH) ===');
      this.logger.log(`CRITICAL: ${vulnerabilityScan.totalCritical}`);
      this.logger.log(`HIGH: ${vulnerabilityScan.totalHigh}`);
    }

    return result;
  }
}
