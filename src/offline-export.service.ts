import { Injectable, Logger } from '@nestjs/common';
import { K8sImagesService } from './k8s-images.service';
import { DockerService, OfflineExportResult } from './docker.service';
import { TrivyService, TrivyScanSummary } from './trivy.service';

export interface OfflineExportOptions {
  helmRelease?: string;
  namespace?: string;
  outputDir?: string;
  showProgress?: boolean;
  scanVulnerabilities?: boolean;
}

export interface CompleteOfflineExportResult extends OfflineExportResult {
  imageListFile: string;
  totalPods: number;
  totalContainers: number;
  vulnerabilityScan?: TrivyScanSummary;
}

@Injectable()
export class OfflineExportService {
  private readonly logger = new Logger(OfflineExportService.name);

  constructor(
    private readonly k8sImagesService: K8sImagesService,
    private readonly dockerService: DockerService,
    private readonly trivyService: TrivyService,
  ) {}

  /**
   * Complete offline export workflow:
   * 1. Export images from K8s
   * 2. Pull images with Docker
   * 3. Save images as tar.gz files
   * 4. Create helper scripts and documentation
   */
  async completeOfflineExport(
    options?: OfflineExportOptions,
  ): Promise<CompleteOfflineExportResult> {
    const {
      helmRelease,
      namespace,
      outputDir = './k8s-images-offline',
      showProgress = true,
      scanVulnerabilities = true,
    } = options || {};

    this.logger.log('=== Starting Complete Offline Export ===');

    // Step 1: Export images from Kubernetes
    const totalSteps = scanVulnerabilities ? 5 : 4;
    this.logger.log(`Step 1/${totalSteps}: Extracting images from Kubernetes...`);
    const k8sExport = await this.k8sImagesService.exportK8sImages({
      helmRelease,
      namespace,
      filename: 'images.txt',
      outputDir,
    });

    if (k8sExport.uniqueImages === 0) {
      throw new Error('No images found to export');
    }

    this.logger.log(
      `Found ${k8sExport.uniqueImages} unique images from ${k8sExport.totalPods} pods`,
    );

    // Step 2-3: Pull and save Docker images with detailed progress
    this.logger.log('\nStep 2/4: Pulling Docker images...');
    this.logger.log('Step 3/4: Saving images to tar.gz files...\n');

    const dockerExport = await this.dockerService.offlineExport(
      k8sExport.images,
      outputDir,
      showProgress,
    );

    // Step 4: Scan vulnerabilities if requested
    let vulnerabilityScan: TrivyScanSummary | undefined;
    if (scanVulnerabilities) {
      this.logger.log(`\nStep 4/${totalSteps}: Scanning images for vulnerabilities...\n`);
      vulnerabilityScan = await this.trivyService.performVulnerabilityScan(
        k8sExport.images,
        outputDir,
        showProgress,
      );
    }

    // Step 5 (or 4 if no scan): Create helper scripts and documentation
    this.logger.log(`\nStep ${totalSteps}/${totalSteps}: Creating helper scripts and documentation...`);
    await this.dockerService.createLoadScript(outputDir);
    await this.dockerService.createOfflineReadme(outputDir, dockerExport);

    const result: CompleteOfflineExportResult = {
      ...dockerExport,
      imageListFile: 'images.txt',
      totalPods: k8sExport.totalPods,
      totalContainers: k8sExport.totalContainers,
      vulnerabilityScan,
    };

    this.logger.log('=== Offline Export Complete ===');
    this.logger.log(`Output Directory: ${result.outputDirectory}`);
    this.logger.log(`Kubernetes Pods: ${result.totalPods}`);
    this.logger.log(`Kubernetes Containers: ${result.totalContainers}`);
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
