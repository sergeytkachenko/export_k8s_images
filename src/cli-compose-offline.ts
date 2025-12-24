#!/usr/bin/env node

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ComposeOfflineExportService } from './compose-offline-export.service';

function parseArgs() {
  const args = process.argv.slice(2);
  const options: {
    composePath?: string;
    outputDir?: string;
    buildIfNeeded?: boolean;
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
      case '-f':
      case '--file':
        options.composePath = args[++i];
        break;
      case '-o':
      case '--output':
        options.outputDir = args[++i];
        break;
      case '-b':
      case '--build':
        options.buildIfNeeded = true;
        break;
      case '-s':
      case '--scan':
        options.scanVulnerabilities = true;
        break;
      case '--no-scan':
        options.scanVulnerabilities = false;
        break;
      default:
        if (!arg.startsWith('-') && !options.composePath) {
          // Treat first non-flag argument as compose file path
          options.composePath = arg;
        }
        break;
    }
  }

  return options;
}

function printHelp() {
  console.log(`
Usage: export-compose-images-offline [options] [compose-file]

Export Docker Compose container images for offline use.
This command will:
  1. Parse the docker-compose.yml file
  2. Extract all image names
  3. Optionally build services that need building
  4. Pull images using Docker
  5. Save images as tar.gz files
  6. Scan for CRITICAL & HIGH vulnerabilities with Trivy (enabled by default)
  7. Create helper scripts for loading images offline

Options:
  -f, --file <path>        Path to docker-compose.yml (default: ./docker-compose.yml)
  -o, --output <dir>       Output directory (default: ./docker-compose-images-offline)
  -b, --build             Build services before exporting (for services with 'build:' directive)
  -s, --scan              Scan for CRITICAL & HIGH vulnerabilities (default: enabled)
  --no-scan               Disable vulnerability scanning
  -h, --help              Show this help message

Examples:
  # Export from default docker-compose.yml
  export-compose-images-offline

  # Export from specific compose file
  export-compose-images-offline -f /path/to/docker-compose.yml

  # Export with building services
  export-compose-images-offline -f docker-compose.yml -b

  # Export to custom directory
  export-compose-images-offline -f docker-compose.yml -o /backup/compose-images

  # Export and scan for vulnerabilities (default behavior)
  export-compose-images-offline -f docker-compose.yml

  # Export without vulnerability scanning
  export-compose-images-offline -f docker-compose.yml --no-scan

  # Alternative syntax (positional argument for compose file)
  export-compose-images-offline docker-compose.yml

Output:
  The tool creates a directory with:
  - *.tar.gz files (Docker images)
  - load-images.sh (script to load images)
  - README.md (instructions)
  - docker-compose-images.txt (list of image names)
  - vulnerability_scan.txt (CRITICAL & HIGH scan enabled by default)
  - vulnerability_summary.json (scan summary enabled by default)

Prerequisites:
  - docker-compose installed
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

  // Default compose file path
  if (!options.composePath) {
    options.composePath = './docker-compose.yml';
  }

  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['log', 'error', 'warn'],
  });

  const composeOfflineExportService = app.get(ComposeOfflineExportService);

  try {
    console.log('╔════════════════════════════════════════════════════════════════╗');
    console.log('║      Docker Compose Images - Offline Export Tool              ║');
    console.log('╚════════════════════════════════════════════════════════════════╝');
    console.log('');

    console.log(`📄 Compose File: ${options.composePath}`);
    if (options.outputDir) {
      console.log(`📁 Output Directory: ${options.outputDir}`);
    }
    if (options.buildIfNeeded) {
      console.log(`🔨 Build Mode: Enabled`);
    }
    console.log('');

    const result = await composeOfflineExportService.completeOfflineExport({
      composePath: options.composePath,
      outputDir: options.outputDir,
      buildIfNeeded: options.buildIfNeeded,
      scanVulnerabilities: options.scanVulnerabilities,
    });

    console.log('');
    console.log('╔════════════════════════════════════════════════════════════════╗');
    console.log('║                     Export Complete!                           ║');
    console.log('╚════════════════════════════════════════════════════════════════╝');
    console.log('');
    console.log('📊 Statistics:');
    console.log(`   • Compose File: ${result.composeFile}`);
    console.log(`   • Total Services: ${result.totalServices}`);
    if (result.servicesBuilt > 0) {
      console.log(`   • Services Built: ${result.servicesBuilt}`);
    }
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
    console.log('   • docker-compose-images.txt - List of all images');
    if (result.vulnerabilityScan) {
      console.log('   • vulnerability_scan.txt - Detailed vulnerability report');
      console.log('   • vulnerability_summary.json - Vulnerability scan summary');
    }
    console.log('');
    console.log('🚀 Next Steps:');
    console.log(`   1. Copy the directory to your offline environment`);
    console.log(`   2. Run: cd ${options.outputDir || './docker-compose-images-offline'}`);
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
    console.error('  • docker-compose.yml file exists and is valid');
    console.error('  • docker-compose is installed');
    console.error('  • Docker is installed and running');
    console.error('  • You have sufficient disk space');
    console.error('  • You have network access to pull images');
    await app.close();
    process.exit(1);
  }
}

bootstrap();
