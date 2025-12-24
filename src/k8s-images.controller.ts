import { Controller, Get, Logger, Query, Post } from '@nestjs/common';
import { K8sImagesService } from './k8s-images.service';
import { OfflineExportService } from './offline-export.service';
import { ComposeOfflineExportService } from './compose-offline-export.service';
import { DockerComposeService } from './docker-compose.service';

@Controller('k8s-images')
export class K8sImagesController {
  private readonly logger = new Logger(K8sImagesController.name);

  constructor(
    private readonly k8sImagesService: K8sImagesService,
    private readonly offlineExportService: OfflineExportService,
    private readonly composeOfflineExportService: ComposeOfflineExportService,
    private readonly dockerComposeService: DockerComposeService,
  ) {}

  @Get('export')
  async exportImages(
    @Query('release') helmRelease?: string,
    @Query('namespace') namespace?: string,
    @Query('filename') filename?: string,
  ) {
    this.logger.log(
      `Received request to export Kubernetes images${helmRelease ? ` for Helm release: ${helmRelease}` : ''}`,
    );

    try {
      const result = await this.k8sImagesService.exportK8sImages({
        helmRelease,
        namespace,
        filename,
      });

      return {
        success: true,
        message: `Images exported successfully to ${filename || 'images.txt'}`,
        data: result,
      };
    } catch (error) {
      this.logger.error('Failed to export images', error.message);

      return {
        success: false,
        message: error.message,
        error: error.stack,
      };
    }
  }

  @Get('releases')
  async getHelmReleases(@Query('namespace') namespace?: string) {
    this.logger.log(
      `Received request to list Helm releases${namespace ? ` in namespace: ${namespace}` : ''}`,
    );

    try {
      const releases = await this.k8sImagesService.getHelmReleases(namespace);

      return {
        success: true,
        message: 'Helm releases retrieved successfully',
        data: {
          count: releases.length,
          releases,
        },
      };
    } catch (error) {
      this.logger.error('Failed to get Helm releases', error.message);

      return {
        success: false,
        message: error.message,
        error: error.stack,
      };
    }
  }

  @Post('export-offline')
  async exportOffline(
    @Query('release') helmRelease?: string,
    @Query('namespace') namespace?: string,
    @Query('outputDir') outputDir?: string,
    @Query('scanVulnerabilities') scanVulnerabilities?: string,
  ) {
    this.logger.log(
      `Received request to export images offline${helmRelease ? ` for Helm release: ${helmRelease}` : ''}`,
    );

    try {
      const result = await this.offlineExportService.completeOfflineExport({
        helmRelease,
        namespace,
        outputDir,
        scanVulnerabilities: scanVulnerabilities === 'true',
      });

      return {
        success: true,
        message: 'Offline export completed successfully',
        data: result,
      };
    } catch (error) {
      this.logger.error('Failed to export images offline', error.message);

      return {
        success: false,
        message: error.message,
        error: error.stack,
      };
    }
  }

  @Post('export-compose')
  async exportCompose(
    @Query('composePath') composePath?: string,
    @Query('filename') filename?: string,
    @Query('buildIfNeeded') buildIfNeeded?: string,
  ) {
    this.logger.log(
      `Received request to export docker-compose images from: ${composePath || 'docker-compose.yml'}`,
    );

    try {
      const result = await this.dockerComposeService.exportComposeImages({
        composePath: composePath || './docker-compose.yml',
        filename,
        buildIfNeeded: buildIfNeeded === 'true',
      });

      return {
        success: true,
        message: `Images exported successfully to ${filename || 'docker-compose-images.txt'}`,
        data: result,
      };
    } catch (error) {
      this.logger.error('Failed to export compose images', error.message);

      return {
        success: false,
        message: error.message,
        error: error.stack,
      };
    }
  }

  @Post('export-compose-offline')
  async exportComposeOffline(
    @Query('composePath') composePath?: string,
    @Query('outputDir') outputDir?: string,
    @Query('buildIfNeeded') buildIfNeeded?: string,
    @Query('scanVulnerabilities') scanVulnerabilities?: string,
  ) {
    this.logger.log(
      `Received request to export docker-compose images offline from: ${composePath || 'docker-compose.yml'}`,
    );

    try {
      const result = await this.composeOfflineExportService.completeOfflineExport({
        composePath: composePath || './docker-compose.yml',
        outputDir,
        buildIfNeeded: buildIfNeeded === 'true',
        scanVulnerabilities: scanVulnerabilities === 'true',
      });

      return {
        success: true,
        message: 'Docker Compose offline export completed successfully',
        data: result,
      };
    } catch (error) {
      this.logger.error('Failed to export compose images offline', error.message);

      return {
        success: false,
        message: error.message,
        error: error.stack,
      };
    }
  }
}
