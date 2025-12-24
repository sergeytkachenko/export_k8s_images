# Offline Export Guide

This guide explains how to export Kubernetes container images for offline use.

## Overview

The offline export feature allows you to:
1. **Extract** images from Kubernetes pods
2. **Pull** images using Docker
3. **Save** images as compressed tar.gz files
4. **Transfer** to offline environments
5. **Load** images in the offline environment

This is useful for air-gapped environments, disaster recovery, or deploying to systems without internet access.

## Prerequisites

- `kubectl` installed and configured
- `Docker` installed and running
- Sufficient disk space (images can be large)
- Network access to pull images

## Quick Start

### Using NPM Scripts

```bash
# Export all images for offline use
npm run export:offline

# Export from default Helm release 'enrichment'
npm run export:offline:release

# Production mode
npm run build
npm run export:offline:prod
npm run export:offline:release:prod
```

### Using Global CLI

```bash
# Install globally first
npm link

# Export all images
export-k8s-images-offline

# Export from specific Helm release
export-k8s-images-offline -r my-release

# Export from Helm release in specific namespace
export-k8s-images-offline -r my-release -n production

# Custom output directory
export-k8s-images-offline -r my-release -o /path/to/output
```

## CLI Options

```
-r, --release <name>     Filter by Helm release name
-n, --namespace <name>   Filter by Kubernetes namespace
-o, --output <dir>       Output directory (default: ./k8s-images-offline)
-h, --help              Show help message
```

## What Happens During Export

### Step 1: Extract Images from Kubernetes
The tool connects to your Kubernetes cluster and extracts all container images from:
- Regular containers
- Init containers
- Ephemeral containers

If you specify a Helm release, it filters pods by Helm labels.

### Step 2: Pull Images with Docker
Each unique image is pulled using `docker pull`. This downloads the images to your local Docker cache.

### Step 3: Save Images as tar.gz Files
Each image is saved as a compressed archive:
```bash
docker save <image> | gzip > <image-name>.tar.gz
```

### Step 4: Create Helper Files
The tool creates:
- `*.tar.gz` - Compressed Docker images
- `load-images.sh` - Bash script to load all images
- `README.md` - Instructions for offline use
- `images.txt` - List of all image names

## Output Structure

```
k8s-images-offline/
├── docker.io_library_nginx_1.21.tar.gz
├── gcr.io_my-app_backend_v1.2.3.tar.gz
├── quay.io_prometheus_node-exporter_v1.2.2.tar.gz
├── load-images.sh
├── README.md
└── images.txt
```

## Transferring to Offline Environment

### Option 1: USB Drive
```bash
# Copy the entire directory
cp -r k8s-images-offline /path/to/usb/

# Transfer to offline system
# Then copy from USB to offline system
```

### Option 2: Network Transfer (if available)
```bash
# Compress the directory
tar -czf k8s-images-offline.tar.gz k8s-images-offline/

# Transfer using scp, rsync, or other tools
scp k8s-images-offline.tar.gz user@offline-system:/path/

# On offline system, extract
tar -xzf k8s-images-offline.tar.gz
```

### Option 3: DVD/CD
```bash
# Burn to disc or create ISO
mkisofs -o k8s-images.iso k8s-images-offline/
```

## Loading Images in Offline Environment

### Method 1: Use the Provided Script (Recommended)

On Linux/Mac:
```bash
cd k8s-images-offline
chmod +x load-images.sh
./load-images.sh
```

### Method 2: Load Manually

Load a single image:
```bash
gunzip -c docker.io_library_nginx_1.21.tar.gz | docker load
```

Load all images:
```bash
cd k8s-images-offline
for file in *.tar.gz; do
  echo "Loading $file..."
  gunzip -c "$file" | docker load
done
```

### Method 3: Windows PowerShell

```powershell
cd k8s-images-offline
Get-ChildItem -Filter *.tar.gz | ForEach-Object {
    Write-Host "Loading $($_.Name)..."
    & docker load -i $_.FullName
}
```

## Verification

After loading, verify images are available:

```bash
docker images
```

You should see all the loaded images in the list.

## HTTP API Usage

You can also trigger offline export via HTTP API:

```bash
# Start the server
npm run start:dev

# Trigger offline export
curl -X POST "http://localhost:3000/k8s-images/export-offline"

# Export from specific Helm release
curl -X POST "http://localhost:3000/k8s-images/export-offline?release=my-release"

# With namespace filter
curl -X POST "http://localhost:3000/k8s-images/export-offline?release=my-release&namespace=production"

# Custom output directory
curl -X POST "http://localhost:3000/k8s-images/export-offline?release=my-release&outputDir=/tmp/my-export"
```

## Examples

### Example 1: Export All Images

```bash
export-k8s-images-offline
```

Output:
```
╔════════════════════════════════════════════════════════════════╗
║         Kubernetes Images - Offline Export Tool               ║
╚════════════════════════════════════════════════════════════════╝

Step 1/4: Extracting images from Kubernetes...
Found 25 unique images from 48 pods

Step 2/4: Pulling Docker images...
Pulling image: nginx:1.21
Pulling image: redis:7.0
...

Step 3/4: Saving images to tar.gz files...
Saving image nginx:1.21 to ./k8s-images-offline/docker.io_library_nginx_1.21.tar.gz
...

Step 4/4: Creating helper scripts and documentation...

╔════════════════════════════════════════════════════════════════╗
║                     Export Complete!                           ║
╚════════════════════════════════════════════════════════════════╝

📊 Statistics:
   • Kubernetes Pods: 48
   • Containers: 72
   • Unique Images: 25
   • Successfully Pulled: 25
   • Successfully Saved: 25

📁 Output Location:
   /path/to/k8s-images-offline

✅ All images are ready for offline use!
```

### Example 2: Export from Specific Helm Release

```bash
export-k8s-images-offline -r enrichment -n production -o /backup/enrichment-images
```

This will:
- Filter pods by Helm release "enrichment"
- Only look in "production" namespace
- Save to `/backup/enrichment-images`

### Example 3: Export Default Release

```bash
npm run export:offline:release
```

Uses the default release from `package.json` (configured as "enrichment").

## Troubleshooting

### Docker Not Available
**Error**: `Docker is not available`

**Solution**: Ensure Docker is installed and running:
```bash
docker --version
docker ps
```

### Permission Denied
**Error**: `Permission denied` when pulling images

**Solution**: Run Docker commands with appropriate permissions or add user to docker group:
```bash
sudo usermod -aG docker $USER
```

### Disk Space Issues
**Error**: `No space left on device`

**Solution**: Check available disk space and clean up if needed:
```bash
df -h
docker system prune -a
```

### Failed Image Pulls
Some images may fail to pull due to:
- Private registries requiring authentication
- Images no longer available
- Network issues

**Solution**: Review the failed pulls list in the output and manually handle those images:
```bash
docker login <registry>
docker pull <failed-image>
```

### Large Export Size
Docker images can be very large (several GB).

**Solutions**:
- Use namespace or Helm release filtering to reduce scope
- Ensure sufficient disk space
- Consider splitting into multiple exports

## Best Practices

1. **Test in Non-Production First**: Always test the offline export and load process in a development environment

2. **Verify Images After Loading**: After loading in offline environment, verify all images loaded correctly

3. **Keep Metadata**: Keep the `images.txt` and `README.md` files for reference

4. **Version Control**: Include the export date in the output directory name:
   ```bash
   export-k8s-images-offline -o k8s-images-$(date +%Y%m%d)
   ```

5. **Regular Updates**: If your cluster images update frequently, create regular offline exports

6. **Storage Management**: Compressed images can be large. Plan for adequate storage in both source and destination.

## Advanced Usage

### Export Multiple Releases

```bash
# Export each release to separate directories
export-k8s-images-offline -r app1 -o offline-app1
export-k8s-images-offline -r app2 -o offline-app2
export-k8s-images-offline -r app3 -o offline-app3
```

### Scripted Workflow

Create a script to automate regular exports:

```bash
#!/bin/bash
DATE=$(date +%Y%m%d)
OUTPUT_DIR="/backup/k8s-images-$DATE"

export-k8s-images-offline -r production-app -o "$OUTPUT_DIR"

# Compress for transfer
tar -czf "${OUTPUT_DIR}.tar.gz" "$OUTPUT_DIR"

# Upload to backup location
scp "${OUTPUT_DIR}.tar.gz" backup-server:/backups/
```

## Disk Space Requirements

Estimate disk space needed:
- **During Export**: 2x the total size of all images (original + compressed)
- **For Transfer**: 1x the total size (compressed archives)
- **On Offline System**: 2x the total size (archives + loaded images)

To check total size of images:
```bash
docker images --format "{{.Size}}" | awk '{sum+=$1} END {print sum}'
```
