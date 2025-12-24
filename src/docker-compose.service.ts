import { Injectable, Logger } from '@nestjs/common';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as yaml from 'js-yaml';

const execAsync = promisify(exec);

export interface DockerComposeImage {
  service: string;
  image: string;
  build?: string;
}

export interface DockerComposeExportResult {
  composeFile: string;
  totalServices: number;
  imagesFromRegistry: string[];
  servicesWithBuild: string[];
}

@Injectable()
export class DockerComposeService {
  private readonly logger = new Logger(DockerComposeService.name);

  /**
   * Parse docker-compose file and extract images
   */
  async parseDockerComposeFile(
    composePath: string,
  ): Promise<DockerComposeExportResult> {
    try {
      this.logger.log(`Parsing docker-compose file: ${composePath}`);

      // Read and parse YAML file
      const fileContent = await fs.readFile(composePath, 'utf-8');
      const composeData: any = yaml.load(fileContent);

      if (!composeData.services) {
        throw new Error('No services found in docker-compose file');
      }

      const services = composeData.services;
      const totalServices = Object.keys(services).length;
      const imagesFromRegistry: string[] = [];
      const servicesWithBuild: string[] = [];

      // Extract images from each service
      for (const [serviceName, serviceConfig] of Object.entries(services)) {
        const config = serviceConfig as any;

        if (config.image) {
          // Service uses a pre-built image
          imagesFromRegistry.push(config.image);
          this.logger.log(`  ${serviceName}: ${config.image}`);
        } else if (config.build) {
          // Service needs to be built
          servicesWithBuild.push(serviceName);
          this.logger.log(`  ${serviceName}: [needs build]`);
        }
      }

      this.logger.log(
        `Found ${totalServices} services: ${imagesFromRegistry.length} with images, ${servicesWithBuild.length} need build`,
      );

      return {
        composeFile: composePath,
        totalServices,
        imagesFromRegistry,
        servicesWithBuild,
      };
    } catch (error) {
      this.logger.error('Failed to parse docker-compose file', error.message);
      throw new Error(`Failed to parse docker-compose: ${error.message}`);
    }
  }

  /**
   * Get images from running docker-compose project
   */
  async getImagesFromRunningCompose(
    projectName?: string,
    composePath?: string,
  ): Promise<string[]> {
    try {
      let command = 'docker-compose ps -q';

      if (composePath) {
        command = `docker-compose -f "${composePath}" ps -q`;
      } else if (projectName) {
        command = `docker-compose -p ${projectName} ps -q`;
      }

      this.logger.log('Getting running containers from docker-compose...');
      const { stdout } = await execAsync(command);

      const containerIds = stdout
        .trim()
        .split('\n')
        .filter((id) => id);

      if (containerIds.length === 0) {
        this.logger.warn('No running containers found');
        return [];
      }

      // Get images from container IDs
      const images: string[] = [];
      for (const containerId of containerIds) {
        const { stdout: imageOutput } = await execAsync(
          `docker inspect -f '{{.Config.Image}}' ${containerId}`,
        );
        const image = imageOutput.trim().replace(/'/g, '');
        if (image) {
          images.push(image);
        }
      }

      const uniqueImages = [...new Set(images)];
      this.logger.log(`Found ${uniqueImages.length} unique images from running containers`);

      return uniqueImages;
    } catch (error) {
      this.logger.error('Failed to get images from running compose', error.message);
      throw new Error(`Failed to get running compose images: ${error.message}`);
    }
  }

  /**
   * Build docker-compose services that need building
   */
  async buildComposeServices(
    composePath: string,
    services?: string[],
  ): Promise<void> {
    try {
      let command = `docker-compose -f "${composePath}" build`;

      if (services && services.length > 0) {
        command += ` ${services.join(' ')}`;
        this.logger.log(`Building services: ${services.join(', ')}`);
      } else {
        this.logger.log('Building all services...');
      }

      await execAsync(command);
      this.logger.log('Build completed successfully');
    } catch (error) {
      this.logger.error('Failed to build compose services', error.message);
      throw new Error(`Failed to build services: ${error.message}`);
    }
  }

  /**
   * Get all images (both from registry and built locally)
   */
  async getAllComposeImages(composePath: string): Promise<string[]> {
    const parsed = await this.parseDockerComposeFile(composePath);
    const images: string[] = [...parsed.imagesFromRegistry];

    // For built services, we need to determine the image name
    // Docker Compose typically uses projectname_servicename format
    if (parsed.servicesWithBuild.length > 0) {
      const projectName = path.basename(path.dirname(composePath));

      for (const serviceName of parsed.servicesWithBuild) {
        // Try common naming patterns
        const possibleNames = [
          `${projectName}_${serviceName}`,
          `${projectName.toLowerCase()}_${serviceName}`,
          serviceName,
        ];

        // Check which image exists
        for (const imageName of possibleNames) {
          try {
            await execAsync(`docker image inspect ${imageName}`);
            images.push(imageName);
            this.logger.log(`  Found built image: ${imageName}`);
            break;
          } catch {
            // Image doesn't exist with this name, try next
          }
        }
      }
    }

    return [...new Set(images)];
  }

  /**
   * Save docker-compose images list to file
   */
  async saveImagesToFile(
    images: string[],
    filename: string = 'docker-compose-images.txt',
  ): Promise<void> {
    try {
      const filePath = path.resolve(process.cwd(), filename);
      const content = images.join('\n');

      await fs.writeFile(filePath, content, 'utf-8');

      this.logger.log(`Successfully saved ${images.length} images to ${filePath}`);
    } catch (error) {
      this.logger.error('Failed to save images to file', error.message);
      throw new Error(`Failed to save images: ${error.message}`);
    }
  }

  /**
   * Export images from docker-compose file
   */
  async exportComposeImages(options: {
    composePath: string;
    filename?: string;
    buildIfNeeded?: boolean;
  }): Promise<{
    totalServices: number;
    totalImages: number;
    images: string[];
    servicesBuilt: number;
  }> {
    const { composePath, filename = 'docker-compose-images.txt', buildIfNeeded = false } = options;

    this.logger.log('Starting docker-compose images export...');

    // Parse compose file
    const parsed = await this.parseDockerComposeFile(composePath);

    // Build services if requested
    let servicesBuilt = 0;
    if (buildIfNeeded && parsed.servicesWithBuild.length > 0) {
      this.logger.log(`Building ${parsed.servicesWithBuild.length} services...`);
      await this.buildComposeServices(composePath, parsed.servicesWithBuild);
      servicesBuilt = parsed.servicesWithBuild.length;
    }

    // Get all images
    const allImages = await this.getAllComposeImages(composePath);

    // Save to file
    await this.saveImagesToFile(allImages, filename);

    this.logger.log(`Export completed: ${parsed.totalServices} services, ${allImages.length} images`);

    return {
      totalServices: parsed.totalServices,
      totalImages: allImages.length,
      images: allImages,
      servicesBuilt,
    };
  }
}
