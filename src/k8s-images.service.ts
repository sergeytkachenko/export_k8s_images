import { Injectable, Logger } from '@nestjs/common';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';
import * as path from 'path';

const execAsync = promisify(exec);

export interface ContainerImage {
  podName: string;
  namespace: string;
  containerName: string;
  image: string;
  helmRelease?: string;
}

export interface HelmRelease {
  name: string;
  namespace: string;
  revision: string;
  status: string;
  chart: string;
  appVersion: string;
}

@Injectable()
export class K8sImagesService {
  private readonly logger = new Logger(K8sImagesService.name);

  /**
   * Get all Helm releases
   */
  async getHelmReleases(namespace?: string): Promise<HelmRelease[]> {
    try {
      const namespaceFlag = namespace ? `-n ${namespace}` : '--all-namespaces';
      this.logger.log(`Fetching Helm releases ${namespace ? `from namespace ${namespace}` : 'from all namespaces'}...`);

      const { stdout, stderr } = await execAsync(
        `helm list ${namespaceFlag} -o json`,
      );

      if (stderr) {
        this.logger.warn(`helm stderr: ${stderr}`);
      }

      return JSON.parse(stdout || '[]');
    } catch (error) {
      this.logger.error('Failed to get Helm releases', error.message);
      throw new Error(`Failed to execute helm: ${error.message}`);
    }
  }

  /**
   * Get all pods from all namespaces using kubectl
   */
  async getAllPods(namespace?: string): Promise<any> {
    try {
      const namespaceFlag = namespace ? `-n ${namespace}` : '--all-namespaces';
      this.logger.log(`Fetching pods ${namespace ? `from namespace ${namespace}` : 'from all namespaces'}...`);

      const { stdout, stderr } = await execAsync(
        `kubectl get pods ${namespaceFlag} -o json`,
      );

      if (stderr) {
        this.logger.warn(`kubectl stderr: ${stderr}`);
      }

      return JSON.parse(stdout);
    } catch (error) {
      this.logger.error('Failed to get pods from kubectl', error.message);
      throw new Error(`Failed to execute kubectl: ${error.message}`);
    }
  }

  /**
   * Filter pods by Helm release label
   */
  filterPodsByHelmRelease(podsData: any, helmReleaseName: string): any {
    if (!podsData.items || !Array.isArray(podsData.items)) {
      return { items: [] };
    }

    const filteredItems = podsData.items.filter((pod) => {
      const labels = pod.metadata?.labels || {};
      // Helm typically uses these labels
      const helmReleaseLabel = labels['app.kubernetes.io/instance'] ||
                              labels['release'] ||
                              labels['helm.sh/chart'];

      return helmReleaseLabel && helmReleaseLabel.includes(helmReleaseName);
    });

    return {
      ...podsData,
      items: filteredItems,
    };
  }

  /**
   * Extract all container images from pods
   */
  extractImages(podsData: any): ContainerImage[] {
    const images: ContainerImage[] = [];

    if (!podsData.items || !Array.isArray(podsData.items)) {
      this.logger.warn('No pods found');
      return images;
    }

    for (const pod of podsData.items) {
      const podName = pod.metadata?.name || 'unknown';
      const namespace = pod.metadata?.namespace || 'default';

      // Extract images from init containers
      if (pod.spec?.initContainers) {
        for (const container of pod.spec.initContainers) {
          images.push({
            podName,
            namespace,
            containerName: container.name,
            image: container.image,
          });
        }
      }

      // Extract images from regular containers
      if (pod.spec?.containers) {
        for (const container of pod.spec.containers) {
          images.push({
            podName,
            namespace,
            containerName: container.name,
            image: container.image,
          });
        }
      }

      // Extract images from ephemeral containers
      if (pod.spec?.ephemeralContainers) {
        for (const container of pod.spec.ephemeralContainers) {
          images.push({
            podName,
            namespace,
            containerName: container.name,
            image: container.image,
          });
        }
      }
    }

    return images;
  }

  /**
   * Get unique images list
   */
  getUniqueImages(images: ContainerImage[]): string[] {
    const uniqueImages = new Set<string>();

    for (const img of images) {
      uniqueImages.add(img.image);
    }

    return Array.from(uniqueImages).sort();
  }

  /**
   * Save images to images.txt file
   */
  async saveImagesToFile(images: string[], filename: string = 'images.txt', outputDir?: string): Promise<void> {
    try {
      const baseDir = outputDir || process.cwd();
      const filePath = path.resolve(baseDir, filename);
      const content = images.join('\n');

      await fs.writeFile(filePath, content, 'utf-8');

      this.logger.log(`Successfully saved ${images.length} images to ${filePath}`);
    } catch (error) {
      this.logger.error('Failed to save images to file', error.message);
      throw new Error(`Failed to save images: ${error.message}`);
    }
  }

  /**
   * Main function to extract and save all Kubernetes images
   */
  async exportK8sImages(options?: {
    helmRelease?: string;
    namespace?: string;
    filename?: string;
    outputDir?: string;
  }): Promise<{
    totalPods: number;
    totalContainers: number;
    uniqueImages: number;
    images: string[];
    helmRelease?: string;
  }> {
    const { helmRelease, namespace, filename = 'images.txt', outputDir } = options || {};

    if (helmRelease) {
      this.logger.log(`Starting Kubernetes images export for Helm release: ${helmRelease}${namespace ? ` in namespace: ${namespace}` : ''}...`);
    } else {
      this.logger.log('Starting Kubernetes images export for all resources...');
    }

    // Get all pods
    let podsData = await this.getAllPods(namespace);

    // Filter by Helm release if specified
    if (helmRelease) {
      podsData = this.filterPodsByHelmRelease(podsData, helmRelease);
      this.logger.log(`Filtered to ${podsData.items?.length || 0} pods for Helm release: ${helmRelease}`);
    }

    const totalPods = podsData.items?.length || 0;

    if (totalPods === 0) {
      this.logger.warn('No pods found matching the criteria');
    }

    // Extract all images
    const allImages = this.extractImages(podsData);
    const totalContainers = allImages.length;

    // Get unique images
    const uniqueImagesList = this.getUniqueImages(allImages);

    // Save to file
    await this.saveImagesToFile(uniqueImagesList, filename, outputDir);

    this.logger.log(`Export completed: ${totalPods} pods, ${totalContainers} containers, ${uniqueImagesList.length} unique images`);

    return {
      totalPods,
      totalContainers,
      uniqueImages: uniqueImagesList.length,
      images: uniqueImagesList,
      helmRelease,
    };
  }
}
