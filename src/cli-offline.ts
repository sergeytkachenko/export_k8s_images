#!/usr/bin/env node

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { OfflineExportService } from './offline-export.service';

function parseArgs() {
  const args = process.argv.slice(2);
  const options: {
    helmRelease?: string;
    namespace?: string;
    outputDir?: string;
    scanVulnerabilities?: boolean;
    help?: boolean;
  } = {
    scanVulnerabilities: true, // Default to true
  };

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
      case '-o':
      case '--output':
        options.outputDir = args[++i];
        break;
      case '-s':
      case '--scan':
        options.scanVulnerabilities = true;
        break;
      case '--no-scan':
        options.scanVulnerabilities = false;
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
Usage: export-k8s-images-offline [options] [release-name]

Export Kubernetes container images for offline use.
This command will:
  1. Extract images from Kubernetes pods
  2. Pull images using Docker
  3. Save images as tar.gz files
  4. Scan for CRITICAL & HIGH vulnerabilities with Trivy (enabled by default)
  5. Create helper scripts for loading images offline

Options:
  -r, --release <name>     Filter by Helm release name
  -n, --namespace <name>   Filter by Kubernetes namespace
  -o, --output <dir>       Output directory (default: ./k8s-images-offline)
  -s, --scan              Scan for CRITICAL & HIGH vulnerabilities (default: enabled)
  --no-scan               Disable vulnerability scanning
  -h, --help              Show this help message

Examples:
  # Export all images from all pods
  export-k8s-images-offline

  # Export images from a specific Helm release
  export-k8s-images-offline -r my-release

  # Export images from a Helm release in a namespace
  export-k8s-images-offline -r my-release -n production

  # Export to a custom directory
  export-k8s-images-offline -r my-release -o /tmp/my-images

  # Export and scan for vulnerabilities (default behavior)
  export-k8s-images-offline -r my-release

  # Export without vulnerability scanning
  export-k8s-images-offline -r my-release --no-scan

  # Alternative syntax (positional argument for release name)
  export-k8s-images-offline my-release

Output:
  The tool creates a directory with:
  - *.tar.gz files (Docker images)
  - load-images.sh (script to load images)
  - README.md (instructions)
  - images.txt (list of image names)
  - vulnerability_scan.txt (CRITICAL & HIGH scan enabled by default)
  - vulnerability_summary.json (scan summary enabled by default)

Prerequisites:
  - kubectl installed and configured
  - Docker installed and running
  - Trivy installed (for vulnerability scanning - enabled by default)
  - Sufficient disk space for image downloads
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

  const offlineExportService = app.get(OfflineExportService);

  try {
    console.log('╔════════════════════════════════════════════════════════════════╗');
    console.log('║         Kubernetes Images - Offline Export Tool               ║');
    console.log('╚════════════════════════════════════════════════════════════════╝');
    console.log('');

    if (options.helmRelease) {
      console.log(`📦 Helm Release: ${options.helmRelease}`);
    }
    if (options.namespace) {
      console.log(`📂 Namespace: ${options.namespace}`);
    }
    if (options.outputDir) {
      console.log(`📁 Output Directory: ${options.outputDir}`);
    }
    console.log('');

    const result = await offlineExportService.completeOfflineExport(options);

    console.log('');
    console.log('╔════════════════════════════════════════════════════════════════╗');
    console.log('║                     Export Complete!                           ║');
    console.log('╚════════════════════════════════════════════════════════════════╝');
    console.log('');
    console.log('📊 Statistics:');
    console.log(`   • Kubernetes Pods: ${result.totalPods}`);
    console.log(`   • Containers: ${result.totalContainers}`);
    console.log(`   • Unique Images: ${result.totalImages}`);
    console.log(`   • Successfully Pulled: ${result.pulledImages}`);
    console.log(`   • Successfully Saved: ${result.savedImages}`);

    if (result.failedPulls.length > 0) {
      console.log('');
      console.log(`⚠️  Failed Pulls (${result.failedPulls.length}):`);
      result.failedPulls.forEach((img) => console.log(`   • ${img}`));
    }

    if (result.failedSaves.length > 0) {
      console.log('');
      console.log(`⚠️  Failed Saves (${result.failedSaves.length}):`);
      result.failedSaves.forEach((img) => console.log(`   • ${img}`));
    }

    if (result.vulnerabilityScan) {
      console.log('');
      console.log('🔒 Vulnerability Scan (CRITICAL & HIGH):');
      console.log(`   • CRITICAL: ${result.vulnerabilityScan.totalCritical}`);
      console.log(`   • HIGH: ${result.vulnerabilityScan.totalHigh}`);
    }

    console.log('');
    console.log('📁 Output Location:');
    console.log(`   ${result.outputDirectory}`);
    console.log('');
    console.log('📄 Files Created:');
    console.log('   • *.tar.gz - Docker image archives');
    console.log('   • load-images.sh - Script to load all images');
    console.log('   • README.md - Detailed instructions');
    console.log('   • images.txt - List of all images');
    if (result.vulnerabilityScan) {
      console.log('   • vulnerability_scan.txt - Detailed vulnerability report');
      console.log('   • vulnerability_summary.json - Vulnerability scan summary');
    }
    console.log('');
    console.log('🚀 Next Steps:');
    console.log(`   1. Copy the directory to your offline environment`);
    console.log(`   2. Run: cd ${options.outputDir || './k8s-images-offline'}`);
    console.log(`   3. Run: ./load-images.sh`);
    console.log('');
    console.log('✅ All images are ready for offline use!');

    await app.close();
    process.exit(0);
  } catch (error) {
    console.error('');
    console.error('❌ Error:', error.message);
    console.error('');
    console.error('Please ensure:');
    console.error('  • kubectl is installed and configured');
    console.error('  • Docker is installed and running');
    console.error('  • You have sufficient disk space');
    console.error('  • You have network access to pull images');
    await app.close();
    process.exit(1);
  }
}

bootstrap();
