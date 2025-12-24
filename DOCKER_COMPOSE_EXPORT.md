# Docker Compose Offline Export Guide

This guide explains how to export Docker Compose container images for offline use.

## Overview

The Docker Compose offline export feature allows you to:
1. **Parse** docker-compose.yml files to extract images
2. **Build** services that need building (optional)
3. **Pull** images using Docker
4. **Save** images as compressed tar.gz files
5. **Transfer** to offline environments
6. **Load** images in the offline environment

This is useful for air-gapped environments, offline deployments, or backing up your Docker Compose stack.

## Prerequisites

- `docker-compose` installed
- `Docker` installed and running
- Sufficient disk space (images can be large)
- Network access to pull images
- A valid `docker-compose.yml` file

## Quick Start

### Using NPM Scripts

```bash
# Export from default docker-compose.yml
npm run export:compose

# Export with building services (for services with 'build:' directive)
npm run export:compose:build

# Production mode
npm run build
npm run export:compose:prod
npm run export:compose:build:prod
```

### Using Global CLI

```bash
# Install globally first
npm link

# Export from default docker-compose.yml
export-compose-images-offline

# Export from specific file
export-compose-images-offline -f /path/to/docker-compose.yml

# Export with building services
export-compose-images-offline -f docker-compose.yml -b

# Custom output directory
export-compose-images-offline -f docker-compose.yml -o /backup/compose-images
```

## CLI Options

```
-f, --file <path>        Path to docker-compose.yml (default: ./docker-compose.yml)
-o, --output <dir>       Output directory (default: ./docker-compose-images-offline)
-b, --build             Build services before exporting
-h, --help              Show help message
```

## What Happens During Export

### Step 1: Parse docker-compose.yml
The tool reads your docker-compose.yml file and identifies:
- Services using pre-built images (`image:` directive)
- Services that need building (`build:` directive)

### Step 2: Build Services (Optional)
If you use the `-b` flag, services with `build:` directives will be built first:
```bash
docker-compose -f docker-compose.yml build
```

### Step 3: Extract All Images
The tool collects all images:
- Images from `image:` directives
- Built images (with naming like `projectname_servicename`)

### Step 4: Pull and Save Images
Each image is:
- Pulled using `docker pull`
- Saved as tar.gz using `docker save | gzip`

### Step 5: Create Helper Files
The tool creates:
- `*.tar.gz` - Compressed Docker images
- `load-images.sh` - Bash script to load all images
- `README.md` - Instructions for offline use
- `docker-compose-images.txt` - List of all image names

## Example docker-compose.yml

```yaml
version: '3.8'

services:
  # Service with pre-built image
  nginx:
    image: nginx:1.21
    ports:
      - "80:80"

  # Service that needs building
  backend:
    build: ./backend
    ports:
      - "3000:3000"

  # Service with registry image
  redis:
    image: redis:7.0
    ports:
      - "6379:6379"

  # Service with specific registry
  postgres:
    image: postgres:14
    environment:
      POSTGRES_PASSWORD: password
```

## Output Structure

```
docker-compose-images-offline/
├── docker.io_library_nginx_1.21.tar.gz
├── docker.io_library_redis_7.0.tar.gz
├── docker.io_library_postgres_14.tar.gz
├── myproject_backend.tar.gz                    # Built service
├── load-images.sh
├── README.md
└── docker-compose-images.txt
```

## Usage Examples

### Example 1: Basic Export

```bash
# Export from default docker-compose.yml
npm run export:compose
```

Output:
```
╔════════════════════════════════════════════════════════════════╗
║      Docker Compose Images - Offline Export Tool              ║
╚════════════════════════════════════════════════════════════════╝

📄 Compose File: ./docker-compose.yml

Step 1/4: Parsing docker-compose file...
  nginx: nginx:1.21
  backend: [needs build]
  redis: redis:7.0
  postgres: postgres:14
Found 4 services: 3 with images, 1 need build

Step 2/4: Pulling Docker images...
Step 3/4: Saving images to tar.gz files...

[1/3] Processing: nginx:1.21
...
✓ Successfully pulled: nginx:1.21

Step 4/4: Creating helper scripts and documentation...

╔════════════════════════════════════════════════════════════════╗
║                     Export Complete!                           ║
╚════════════════════════════════════════════════════════════════╝

📊 Statistics:
   • Total Services: 4
   • Unique Images: 3
   • Successfully Pulled: 3
   • Successfully Saved: 3

✅ All images are ready for offline use!
```

### Example 2: Export with Build

```bash
# Build services first, then export all images
export-compose-images-offline -f docker-compose.yml -b
```

This will:
1. Build the `backend` service
2. Pull `nginx:1.21`, `redis:7.0`, `postgres:14`
3. Export all 4 images (3 pulled + 1 built)

### Example 3: Export from Specific File

```bash
# Export from production compose file
export-compose-images-offline -f docker-compose.prod.yml -o /backup/prod-images
```

### Example 4: HTTP API

```bash
# Start the server
npm run start:dev

# Export compose images (list only)
curl -X POST "http://localhost:3000/k8s-images/export-compose?composePath=docker-compose.yml"

# Export for offline use
curl -X POST "http://localhost:3000/k8s-images/export-compose-offline?composePath=docker-compose.yml"

# Export with build
curl -X POST "http://localhost:3000/k8s-images/export-compose-offline?composePath=docker-compose.yml&buildIfNeeded=true"
```

## Transferring to Offline Environment

Same as Kubernetes offline export:

### Option 1: USB Drive
```bash
cp -r docker-compose-images-offline /path/to/usb/
```

### Option 2: Compress and Transfer
```bash
tar -czf docker-compose-images.tar.gz docker-compose-images-offline/
scp docker-compose-images.tar.gz user@offline-system:/path/
```

## Loading Images in Offline Environment

### Method 1: Use the Provided Script

On Linux/Mac:
```bash
cd docker-compose-images-offline
chmod +x load-images.sh
./load-images.sh
```

### Method 2: Load Manually

```bash
cd docker-compose-images-offline
for file in *.tar.gz; do
  gunzip -c "$file" | docker load
done
```

### Method 3: Windows PowerShell

```powershell
cd docker-compose-images-offline
Get-ChildItem -Filter *.tar.gz | ForEach-Object {
    Write-Host "Loading $($_.Name)..."
    & docker load -i $_.FullName
}
```

## Verification

After loading images:

```bash
# Verify images are loaded
docker images

# Test with docker-compose
docker-compose -f docker-compose.yml up
```

## Differences: Images vs Build

### Services with `image:` directive

```yaml
nginx:
  image: nginx:1.21
```

**Behavior:**
- Image is pulled from registry
- No build needed
- Exported as `docker.io_library_nginx_1.21.tar.gz`

### Services with `build:` directive

```yaml
backend:
  build: ./backend
```

**Without `-b` flag:**
- Service is skipped (needs to be built manually)
- Image name guessed from project structure

**With `-b` flag:**
- Service is built using `docker-compose build`
- Built image is included in export
- Exported as `projectname_backend.tar.gz`

## Common Scenarios

### Scenario 1: Production Deployment

```yaml
# docker-compose.prod.yml
services:
  web:
    image: myregistry.com/myapp:v1.2.3
  db:
    image: postgres:14
```

```bash
# Export for offline production deployment
export-compose-images-offline -f docker-compose.prod.yml -o /backup/prod-v1.2.3
```

### Scenario 2: Development Stack with Builds

```yaml
# docker-compose.dev.yml
services:
  frontend:
    build: ./frontend
  backend:
    build: ./backend
  db:
    image: postgres:14-alpine
```

```bash
# Build and export everything
export-compose-images-offline -f docker-compose.dev.yml -b -o /backup/dev-stack
```

### Scenario 3: Mixed Services

```yaml
services:
  app:
    build: .
  nginx:
    image: nginx:alpine
  redis:
    image: redis:7
```

```bash
# Build the app service, then export all
export-compose-images-offline -b
```

## Troubleshooting

### Error: "No services found in docker-compose file"

**Cause**: Invalid or empty docker-compose.yml

**Solution**:
```bash
# Validate your compose file
docker-compose -f docker-compose.yml config
```

### Error: "Failed to parse docker-compose"

**Cause**: Syntax error in YAML file

**Solution**:
```bash
# Check YAML syntax
docker-compose -f docker-compose.yml config --quiet
```

### Warning: "Service needs build"

**Cause**: Service has `build:` directive but `-b` flag not used

**Solution**:
```bash
# Either build manually first
docker-compose build

# Or use -b flag
export-compose-images-offline -b
```

### Built Image Not Found

**Cause**: Image name guessing failed

**Solution**:
```bash
# Build the service first
docker-compose build

# Check image names
docker images

# Use -b flag for automatic building
export-compose-images-offline -b
```

## Best Practices

1. **Always Validate First**
   ```bash
   docker-compose config
   ```

2. **Use Specific Tags**
   ```yaml
   # Good: specific version
   image: nginx:1.21.0

   # Avoid: latest tag
   image: nginx:latest
   ```

3. **Build Before Export**
   - For services with `build:`, use `-b` flag or build manually first

4. **Test in Dev First**
   - Export and load in development environment before production

5. **Keep Compose File with Export**
   - Copy docker-compose.yml to the export directory for reference

6. **Version Your Exports**
   ```bash
   export-compose-images-offline -o compose-backup-$(date +%Y%m%d)
   ```

## Comparison: Kubernetes vs Docker Compose

| Feature | Kubernetes Export | Docker Compose Export |
|---------|------------------|----------------------|
| Source | kubectl + pods | docker-compose.yml |
| Filtering | Helm release, namespace | Compose file path |
| Build support | ❌ | ✅ (with `-b` flag) |
| Running containers | ✅ | ✅ (optional) |
| Complexity | Higher (cluster) | Lower (file-based) |

## Integration with CI/CD

### Example GitLab CI

```yaml
export-images:
  stage: build
  script:
    - npm install
    - npm run build
    - npm run export:compose:build
  artifacts:
    paths:
      - docker-compose-images-offline/
```

### Example GitHub Actions

```yaml
- name: Export Docker Compose Images
  run: |
    npm install
    npm run build
    npm run export:compose:build
- name: Upload artifacts
  uses: actions/upload-artifact@v2
  with:
    name: compose-images
    path: docker-compose-images-offline/
```

## HTTP API Reference

### Export Images List

```bash
POST /k8s-images/export-compose?composePath=docker-compose.yml&buildIfNeeded=true
```

**Response:**
```json
{
  "success": true,
  "message": "Images exported successfully",
  "data": {
    "totalServices": 4,
    "totalImages": 4,
    "images": ["nginx:1.21", "redis:7.0", ...],
    "servicesBuilt": 1
  }
}
```

### Offline Export

```bash
POST /k8s-images/export-compose-offline?composePath=docker-compose.yml&outputDir=/tmp/export&buildIfNeeded=true
```

**Response:**
```json
{
  "success": true,
  "message": "Docker Compose offline export completed successfully",
  "data": {
    "totalServices": 4,
    "totalImages": 4,
    "pulledImages": 4,
    "savedImages": 4,
    "failedPulls": [],
    "failedSaves": [],
    "outputDirectory": "/tmp/export",
    "servicesBuilt": 1
  }
}
```
