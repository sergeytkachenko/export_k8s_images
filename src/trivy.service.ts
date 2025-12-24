import { Injectable, Logger } from '@nestjs/common';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';
import * as path from 'path';

const execAsync = promisify(exec);

export interface VulnerabilityScanResult {
  image: string;
  success: boolean;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  error?: string;
}

export interface TrivyScanSummary {
  totalImagesScanned: number;
  successfulScans: number;
  failedScans: number;
  totalCritical: number;
  totalHigh: number;
  totalMedium: number;
  totalLow: number;
  reportFile: string;
  scanResults: VulnerabilityScanResult[];
}

@Injectable()
export class TrivyService {
  private readonly logger = new Logger(TrivyService.name);

  /**
   * Check if Trivy is available
   */
  async checkTrivyAvailable(): Promise<boolean> {
    try {
      await execAsync('trivy --version');
      return true;
    } catch (error) {
      this.logger.error('Trivy is not available', error.message);
      return false;
    }
  }

  /**
   * Scan a single image with Trivy
   */
  async scanImage(
    image: string,
    showProgress: boolean = false,
  ): Promise<VulnerabilityScanResult> {
    try {
      if (showProgress) {
        this.logger.log(`Scanning image: ${image}`);
      }

      // Run Trivy scan with JSON output - only CRITICAL and HIGH severities
      const { stdout } = await execAsync(
        `trivy image --format json --quiet --severity CRITICAL,HIGH ${image}`,
      );

      // Parse JSON output
      const scanData = JSON.parse(stdout);

      // Count vulnerabilities by severity
      let criticalCount = 0;
      let highCount = 0;
      let mediumCount = 0;
      let lowCount = 0;

      if (scanData.Results) {
        for (const result of scanData.Results) {
          if (result.Vulnerabilities) {
            for (const vuln of result.Vulnerabilities) {
              switch (vuln.Severity) {
                case 'CRITICAL':
                  criticalCount++;
                  break;
                case 'HIGH':
                  highCount++;
                  break;
                case 'MEDIUM':
                  mediumCount++;
                  break;
                case 'LOW':
                  lowCount++;
                  break;
              }
            }
          }
        }
      }

      if (showProgress) {
        this.logger.log(
          `  ✓ Scan complete: ${criticalCount} critical, ${highCount} high, ${mediumCount} medium, ${lowCount} low`,
        );
      }

      return {
        image,
        success: true,
        criticalCount,
        highCount,
        mediumCount,
        lowCount,
      };
    } catch (error) {
      this.logger.error(`Failed to scan ${image}`, error.message);
      return {
        image,
        success: false,
        criticalCount: 0,
        highCount: 0,
        mediumCount: 0,
        lowCount: 0,
        error: error.message,
      };
    }
  }

  /**
   * Scan multiple images
   */
  async scanImages(
    images: string[],
    showProgress: boolean = false,
  ): Promise<VulnerabilityScanResult[]> {
    this.logger.log(`Scanning ${images.length} images with Trivy...`);
    const results: VulnerabilityScanResult[] = [];

    for (let i = 0; i < images.length; i++) {
      const image = images[i];
      if (showProgress) {
        this.logger.log(`\n[${i + 1}/${images.length}] ${image}`);
      }
      const result = await this.scanImage(image, showProgress);
      results.push(result);
    }

    return results;
  }

  /**
   * Generate detailed scan report
   */
  async generateDetailedReport(
    images: string[],
    outputFile: string,
  ): Promise<void> {
    try {
      this.logger.log(`Generating detailed vulnerability report...`);

      let report = '═══════════════════════════════════════════════════════════════\n';
      report += '           VULNERABILITY SCAN REPORT (Trivy)\n';
      report += '═══════════════════════════════════════════════════════════════\n\n';
      report += `Scan Date: ${new Date().toISOString()}\n`;
      report += `Severity Filter: CRITICAL, HIGH\n`;
      report += `Total Images Scanned: ${images.length}\n\n`;

      for (let i = 0; i < images.length; i++) {
        const image = images[i];
        report += `\n${'─'.repeat(65)}\n`;
        report += `[${i + 1}/${images.length}] Image: ${image}\n`;
        report += `${'─'.repeat(65)}\n\n`;

        try {
          // Run Trivy scan with table output for detailed report - only CRITICAL and HIGH
          const { stdout } = await execAsync(
            `trivy image --format table --quiet --severity CRITICAL,HIGH ${image}`,
          );
          report += stdout + '\n';
        } catch (error) {
          report += `ERROR: Failed to scan image\n`;
          report += `${error.message}\n\n`;
        }
      }

      report += '\n═══════════════════════════════════════════════════════════════\n';
      report += '                      END OF REPORT\n';
      report += '═══════════════════════════════════════════════════════════════\n';

      await fs.writeFile(outputFile, report, 'utf-8');
      this.logger.log(`Detailed report saved to: ${outputFile}`);
    } catch (error) {
      this.logger.error('Failed to generate detailed report', error.message);
      throw error;
    }
  }

  /**
   * Complete vulnerability scan workflow
   */
  async performVulnerabilityScan(
    images: string[],
    outputDir: string = '.',
    showProgress: boolean = true,
  ): Promise<TrivyScanSummary> {
    // Check Trivy availability
    const trivyAvailable = await this.checkTrivyAvailable();
    if (!trivyAvailable) {
      throw new Error(
        'Trivy is not available. Please install Trivy: https://github.com/aquasecurity/trivy#installation',
      );
    }

    // Scan all images
    const scanResults = await this.scanImages(images, showProgress);

    // Calculate summary
    const successfulScans = scanResults.filter((r) => r.success).length;
    const failedScans = scanResults.filter((r) => !r.success).length;
    const totalCritical = scanResults.reduce((sum, r) => sum + r.criticalCount, 0);
    const totalHigh = scanResults.reduce((sum, r) => sum + r.highCount, 0);
    const totalMedium = scanResults.reduce((sum, r) => sum + r.mediumCount, 0);
    const totalLow = scanResults.reduce((sum, r) => sum + r.lowCount, 0);

    // Generate detailed report
    const reportFile = path.join(outputDir, 'vulnerability_scan.txt');
    await this.generateDetailedReport(images, reportFile);

    // Generate summary file
    const summaryFile = path.join(outputDir, 'vulnerability_summary.json');
    const summary: TrivyScanSummary = {
      totalImagesScanned: images.length,
      successfulScans,
      failedScans,
      totalCritical,
      totalHigh,
      totalMedium,
      totalLow,
      reportFile,
      scanResults,
    };

    await fs.writeFile(summaryFile, JSON.stringify(summary, null, 2), 'utf-8');
    this.logger.log(`Summary saved to: ${summaryFile}`);

    this.logger.log('\n=== Vulnerability Scan Summary (CRITICAL & HIGH) ===');
    this.logger.log(`Total Images: ${images.length}`);
    this.logger.log(`Successful Scans: ${successfulScans}`);
    this.logger.log(`Failed Scans: ${failedScans}`);
    this.logger.log(`Total CRITICAL: ${totalCritical}`);
    this.logger.log(`Total HIGH: ${totalHigh}`);

    return summary;
  }
}
