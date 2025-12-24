# Feature Summary - Offline Export

## Overview

The project now includes a complete **Offline Export** feature that enables exporting Kubernetes container images for air-gapped and offline environments.

## What Was Added

### 1. New Services

#### DockerService (`src/docker.service.ts`)
Handles all Docker operations:
- Check Docker availability
- Pull Docker images
- Save images as tar.gz archives
- Create helper scripts for offline loading
- Generate documentation

**Key Methods:**
- `pullImage(image)` - Pull a single Docker image
- `pullImages(images)` - Pull multiple images
- `saveImage(image, outputDir)` - Save image as tar.gz
- `saveImages(images, outputDir)` - Save multiple images
- `offlineExport(images, outputDir)` - Complete workflow
- `createLoadScript(outputDir)` - Generate load-images.sh
- `createOfflineReadme(outputDir, result)` - Generate README.md

#### OfflineExportService (`src/offline-export.service.ts`)
Orchestrates the complete workflow:
1. Extract images from Kubernetes (using K8sImagesService)
2. Pull images with Docker (using DockerService)
3. Save images as tar.gz files (using DockerService)
4. Create helper scripts and documentation

**Key Method:**
- `completeOfflineExport(options)` - Main workflow orchestrator

### 2. New CLI Tool

#### Offline Export CLI (`src/cli-offline.ts`)
Beautiful CLI interface for offline export:

```bash
export-k8s-images-offline [options] [release-name]
```

**Features:**
- Command-line argument parsing
- Beautiful formatted output with boxes and emojis
- Progress tracking through all 4 steps
- Detailed statistics and summary
- Help documentation
- Error handling with helpful messages

**Options:**
- `-r, --release <name>` - Filter by Helm release
- `-n, --namespace <name>` - Filter by namespace
- `-o, --output <dir>` - Custom output directory
- `-h, --help` - Show help

### 3. HTTP API Endpoint

#### New Controller Endpoint
`POST /k8s-images/export-offline` - Trigger offline export via HTTP

**Query Parameters:**
- `release` - Helm release name
- `namespace` - Kubernetes namespace
- `outputDir` - Custom output directory

**Example:**
```bash
curl -X POST "http://localhost:3000/k8s-images/export-offline?release=my-release&namespace=production"
```

### 4. NPM Scripts

Added 4 new npm scripts:

```json
{
  "export:offline": "ts-node src/cli-offline.ts",
  "export:offline:prod": "node dist/cli-offline.js",
  "export:offline:release": "ts-node src/cli-offline.ts -r $npm_package_config_defaultRelease",
  "export:offline:release:prod": "node dist/cli-offline.js -r $npm_package_config_defaultRelease"
}
```

### 5. Binary Command

Added second global CLI command:

```json
{
  "bin": {
    "export-k8s-images": "./dist/cli.js",
    "export-k8s-images-offline": "./dist/cli-offline.js"
  }
}
```

### 6. Documentation

Created comprehensive documentation:

1. **OFFLINE_EXPORT.md** - Complete guide
   - Overview and prerequisites
   - Quick start examples
   - Detailed workflow explanation
   - Transfer methods
   - Loading instructions
   - Troubleshooting
   - Best practices

2. **Updated README.md**
   - Added offline export section
   - New features list
   - Prerequisites for Docker
   - Usage examples

3. **Updated COMMANDS.md**
   - All offline export commands
   - CLI options
   - HTTP API endpoints

4. **Updated QUICK_START.md**
   - Quick offline export examples
   - Integration with existing features

## Complete Workflow

### Step 1: Export Images from Kubernetes
```bash
export-k8s-images-offline -r enrichment
```

The tool:
1. Connects to Kubernetes cluster via kubectl
2. Fetches all pods (filtered by Helm release if specified)
3. Extracts unique container images
4. Saves list to images.txt

### Step 2: Pull Images with Docker
For each unique image:
```bash
docker pull <image>
```

### Step 3: Save as tar.gz Archives
For each pulled image:
```bash
docker save <image> | gzip > <sanitized-name>.tar.gz
```

### Step 4: Create Helper Files
Generated files:
- `*.tar.gz` - Compressed Docker images
- `load-images.sh` - Bash script to load all images
- `README.md` - Complete instructions
- `images.txt` - List of all images

## Usage Examples

### Basic Export
```bash
# All images
npm run export:offline

# Default Helm release
npm run export:offline:release

# Global CLI
export-k8s-images-offline
```

### Filtered Export
```bash
# Specific Helm release
export-k8s-images-offline -r my-app

# With namespace
export-k8s-images-offline -r my-app -n production

# Custom output
export-k8s-images-offline -r my-app -o /backup/images
```

### HTTP API
```bash
# Start server
npm run start:dev

# Trigger export
curl -X POST "http://localhost:3000/k8s-images/export-offline?release=my-app"
```

## Output Structure

```
k8s-images-offline/
├── docker.io_library_nginx_1.21.0.tar.gz          # Compressed image
├── gcr.io_google-samples_hello-app_1.0.tar.gz     # Compressed image
├── k8s.gcr.io_kube-proxy_v1.22.0.tar.gz          # Compressed image
├── quay.io_prometheus_node-exporter_v1.2.2.tar.gz # Compressed image
├── load-images.sh                                 # Load script
├── README.md                                      # Instructions
└── images.txt                                     # Image list
```

## Loading in Offline Environment

### Linux/Mac
```bash
cd k8s-images-offline
chmod +x load-images.sh
./load-images.sh
```

### Manual
```bash
gunzip -c image.tar.gz | docker load
```

### Windows PowerShell
```powershell
Get-ChildItem -Filter *.tar.gz | ForEach-Object {
    & docker load -i $_.FullName
}
```

## Key Features

✅ **Complete Automation**
- Single command exports everything
- No manual intervention needed

✅ **Helm Release Filtering**
- Export only images from specific applications
- Reduces export size and time

✅ **Beautiful CLI**
- Progress indicators
- Formatted output
- Detailed statistics

✅ **Error Handling**
- Reports failed pulls and saves
- Continues on errors
- Provides helpful error messages

✅ **Offline Ready**
- Includes load scripts
- Complete documentation
- Works on Linux, Mac, and Windows

✅ **Flexible Output**
- Custom output directories
- Configurable via CLI or API
- Integration with existing tools

## Architecture

```
┌─────────────────────────────────────────────────────┐
│              User Interface Layer                   │
│  - CLI (cli-offline.ts)                            │
│  - HTTP API (k8s-images.controller.ts)             │
│  - NPM Scripts (package.json)                      │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│         Orchestration Layer                         │
│  - OfflineExportService                            │
│    (Coordinates the workflow)                      │
└────────┬───────────────────────┬────────────────────┘
         │                       │
         ▼                       ▼
┌────────────────────┐  ┌───────────────────────────┐
│ K8sImagesService   │  │    DockerService          │
│ - Get pods         │  │ - Pull images             │
│ - Filter by Helm   │  │ - Save as tar.gz          │
│ - Extract images   │  │ - Create load scripts     │
└────────────────────┘  └───────────────────────────┘
         │                       │
         ▼                       ▼
┌────────────────────┐  ┌───────────────────────────┐
│    kubectl CLI     │  │      Docker CLI           │
└────────────────────┘  └───────────────────────────┘
```

## Integration with Existing Features

The offline export seamlessly integrates with:
- ✅ Helm release filtering
- ✅ Namespace filtering
- ✅ Default release configuration (package.json)
- ✅ HTTP API
- ✅ Global CLI installation
- ✅ Development and production modes

## Testing

To test the offline export:

```bash
# 1. Build the project
npm run build

# 2. Test with a small Helm release
export-k8s-images-offline -r small-app -o /tmp/test-export

# 3. Verify output
ls -lh /tmp/test-export
cat /tmp/test-export/README.md

# 4. Test loading (optional)
cd /tmp/test-export
./load-images.sh
```

## Dependencies

No new package dependencies were added. The feature uses:
- Node.js built-in modules (child_process, fs, path, util)
- Existing NestJS framework
- External CLI tools: kubectl, docker, helm

## File Changes Summary

**New Files:**
- `src/docker.service.ts` - Docker operations service
- `src/offline-export.service.ts` - Workflow orchestrator
- `src/cli-offline.ts` - Offline export CLI
- `OFFLINE_EXPORT.md` - Complete documentation
- `FEATURE_SUMMARY.md` - This file

**Modified Files:**
- `src/app.module.ts` - Added new services
- `src/k8s-images.controller.ts` - Added offline export endpoint
- `package.json` - Added scripts and bin command
- `README.md` - Added offline export section
- `COMMANDS.md` - Added offline export commands
- `QUICK_START.md` - Added offline export examples

**Total Lines of Code Added:** ~1,000+
**Total New Services:** 2
**Total New CLI Tools:** 1
**Total New API Endpoints:** 1
**Total New NPM Scripts:** 4

## Next Steps

Potential future enhancements:
1. Parallel image pulling for faster exports
2. Progress bars for individual image downloads
3. Image size estimation before export
4. Export resume capability for interrupted exports
5. Incremental exports (only new/changed images)
6. Image vulnerability scanning before export
7. Multi-architecture image support
8. Registry authentication configuration
