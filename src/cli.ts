#!/usr/bin/env node

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { K8sImagesService } from './k8s-images.service';

function parseArgs() {
  const args = process.argv.slice(2);
  const options: {
    helmRelease?: string;
    namespace?: string;
    filename?: string;
    help?: boolean;
  } = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    switch (arg) {
      case '-h':
      case '--help':
        options.help = true;
        break;
      case '-r':
      case '--release':
        options.helmRelease = args[++i];
        break;
      case '-n':
      case '--namespace':
        options.namespace = args[++i];
        break;
      case '-f':
      case '--file':
        options.filename = args[++i];
        break;
      default:
        if (!arg.startsWith('-')) {
          // Treat first non-flag argument as release name
          options.helmRelease = arg;
        }
        break;
    }
  }

  return options;
}

function printHelp() {
  console.log(`
Usage: export-k8s-images [options] [release-name]

Export Kubernetes container images to a file.

Options:
  -r, --release <name>     Filter by Helm release name
  -n, --namespace <name>   Filter by Kubernetes namespace
  -f, --file <filename>    Output filename (default: images.txt)
  -h, --help              Show this help message

Examples:
  # Export all images from all pods
  export-k8s-images

  # Export images from a specific Helm release
  export-k8s-images -r my-release

  # Export images from a specific Helm release in a namespace
  export-k8s-images -r my-release -n production

  # Export to a custom filename
  export-k8s-images -r my-release -f my-images.txt

  # Alternative syntax (positional argument for release name)
  export-k8s-images my-release
`);
}

async function bootstrap() {
  const options = parseArgs();

  if (options.help) {
    printHelp();
    process.exit(0);
  }

  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['log', 'error', 'warn'],
  });

  const k8sImagesService = app.get(K8sImagesService);

  try {
    console.log('Starting Kubernetes images export...\n');

    if (options.helmRelease) {
      console.log(`Filtering by Helm release: ${options.helmRelease}`);
    }
    if (options.namespace) {
      console.log(`Filtering by namespace: ${options.namespace}`);
    }
    console.log('');

    const result = await k8sImagesService.exportK8sImages(options);

    console.log('\n=== Export Summary ===');
    if (result.helmRelease) {
      console.log(`Helm Release: ${result.helmRelease}`);
    }
    console.log(`Total Pods: ${result.totalPods}`);
    console.log(`Total Containers: ${result.totalContainers}`);
    console.log(`Unique Images: ${result.uniqueImages}`);
    console.log('\n=== Images List ===');
    result.images.forEach((image) => console.log(image));
    console.log(`\n✅ Images have been saved to ${options.filename || 'images.txt'}`);

    await app.close();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    await app.close();
    process.exit(1);
  }
}

bootstrap();
