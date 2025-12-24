# Available Commands

## NPM Scripts

### Build & Development
```bash
npm run build              # Build the project
npm run format             # Format code with Prettier
npm run lint               # Lint and fix TypeScript files
```

### Run the Application
```bash
npm run start              # Start in normal mode
npm run start:dev          # Start in watch mode (auto-reload)
npm run start:debug        # Start in debug mode
npm run start:prod         # Start production build
```

### Export K8s Images (List Only)
```bash
npm run export                # Export all images to images.txt (development mode)
npm run export:prod           # Export all images to images.txt (production mode)
npm run export:release        # Export images from default Helm release 'enrichment' (dev mode)
npm run export:release:prod   # Export images from default Helm release 'enrichment' (prod mode)
```

### Export K8s Images (Offline - Pull + Save as tar.gz)
```bash
npm run export:offline                # Export all images for offline use (dev mode)
npm run export:offline:prod           # Export all images for offline use (prod mode)
npm run export:offline:release        # Export default Helm release for offline (dev mode)
npm run export:offline:release:prod   # Export default Helm release for offline (prod mode)
```

### Export Docker Compose Images (Offline)
```bash
npm run export:compose                # Export from docker-compose.yml (dev mode)
npm run export:compose:prod           # Export from docker-compose.yml (prod mode)
npm run export:compose:build          # Export with building services (dev mode)
npm run export:compose:build:prod     # Export with building services (prod mode)
```

### Testing
```bash
npm run test               # Run unit tests
npm run test:watch         # Run tests in watch mode
npm run test:cov           # Run tests with coverage
npm run test:debug         # Run tests in debug mode
npm run test:e2e           # Run end-to-end tests
```

## Global CLI Commands

After installing globally with `npm link`:

### List Export (images.txt only)

```bash
export-k8s-images                                    # Export all images to images.txt
export-k8s-images -r my-release                      # Export from Helm release
export-k8s-images -r my-release -n production        # Export from Helm release in namespace
export-k8s-images -r my-release -f custom.txt        # Export to custom file
export-k8s-images --help                             # Show help
```

**CLI Options:**
```
-r, --release <name>     Filter by Helm release name
-n, --namespace <name>   Filter by Kubernetes namespace
-f, --file <filename>    Output filename (default: images.txt)
-h, --help              Show help message
```

### Offline Export - Kubernetes (Pull + Save as tar.gz)

```bash
export-k8s-images-offline                            # Export all images for offline use
export-k8s-images-offline -r my-release              # Export from Helm release
export-k8s-images-offline -r my-release -n production # Export from Helm release in namespace
export-k8s-images-offline -o /backup/images          # Custom output directory
export-k8s-images-offline -r my-release --scan       # Export and scan for vulnerabilities
export-k8s-images-offline --help                     # Show help
```

**CLI Options:**
```
-r, --release <name>     Filter by Helm release name
-n, --namespace <name>   Filter by Kubernetes namespace
-o, --output <dir>       Output directory (default: ./k8s-images-offline)
-s, --scan              Scan for CRITICAL & HIGH vulnerabilities (default: enabled)
--no-scan               Disable vulnerability scanning
-h, --help              Show help message
```

### Offline Export - Docker Compose (Pull + Save as tar.gz)

```bash
export-compose-images-offline                        # Export from default docker-compose.yml
export-compose-images-offline -f docker-compose.yml  # Export from specific file
export-compose-images-offline -f docker-compose.yml -b # Export with building services
export-compose-images-offline -o /backup/compose     # Custom output directory
export-compose-images-offline -f docker-compose.yml --scan # Export and scan for vulnerabilities
export-compose-images-offline --help                 # Show help
```

**CLI Options:**
```
-f, --file <path>        Path to docker-compose.yml (default: ./docker-compose.yml)
-o, --output <dir>       Output directory (default: ./docker-compose-images-offline)
-b, --build             Build services before exporting
-s, --scan              Scan for CRITICAL & HIGH vulnerabilities (default: enabled)
--no-scan               Disable vulnerability scanning
-h, --help              Show help message
```

## HTTP API Endpoints

When the server is running (`npm run start:dev`):

### List Export (images.txt)

```bash
# Export all images
GET http://localhost:3000/k8s-images/export

# Export images from specific Helm release
GET http://localhost:3000/k8s-images/export?release=my-release

# Export images from Helm release in specific namespace
GET http://localhost:3000/k8s-images/export?release=my-release&namespace=production

# Export to custom file
GET http://localhost:3000/k8s-images/export?release=my-release&filename=custom.txt

# Examples with curl
curl http://localhost:3000/k8s-images/export
curl "http://localhost:3000/k8s-images/export?release=my-release"
curl "http://localhost:3000/k8s-images/export?release=my-release&namespace=production"
```

### Offline Export (Pull + Save)

```bash
# Export all images for offline use
POST http://localhost:3000/k8s-images/export-offline

# Export from specific Helm release
POST http://localhost:3000/k8s-images/export-offline?release=my-release

# Export with namespace filter
POST http://localhost:3000/k8s-images/export-offline?release=my-release&namespace=production

# Custom output directory
POST http://localhost:3000/k8s-images/export-offline?release=my-release&outputDir=/backup/images

# Export and scan for vulnerabilities
POST http://localhost:3000/k8s-images/export-offline?release=my-release&scanVulnerabilities=true

# Examples with curl
curl -X POST http://localhost:3000/k8s-images/export-offline
curl -X POST "http://localhost:3000/k8s-images/export-offline?release=my-release"
curl -X POST "http://localhost:3000/k8s-images/export-offline?release=my-release&namespace=production"
curl -X POST "http://localhost:3000/k8s-images/export-offline?release=my-release&scanVulnerabilities=true"
```

### Docker Compose Export

```bash
# Export images list from compose file
POST http://localhost:3000/k8s-images/export-compose?composePath=docker-compose.yml

# Export with build
POST http://localhost:3000/k8s-images/export-compose?composePath=docker-compose.yml&buildIfNeeded=true

# Offline export from compose file
POST http://localhost:3000/k8s-images/export-compose-offline?composePath=docker-compose.yml

# Offline export with build
POST http://localhost:3000/k8s-images/export-compose-offline?composePath=docker-compose.yml&buildIfNeeded=true&outputDir=/backup

# Offline export with vulnerability scan
POST http://localhost:3000/k8s-images/export-compose-offline?composePath=docker-compose.yml&scanVulnerabilities=true

# Examples with curl
curl -X POST "http://localhost:3000/k8s-images/export-compose?composePath=docker-compose.yml"
curl -X POST "http://localhost:3000/k8s-images/export-compose-offline?composePath=docker-compose.yml&buildIfNeeded=true"
curl -X POST "http://localhost:3000/k8s-images/export-compose-offline?composePath=docker-compose.yml&scanVulnerabilities=true"
```

### Helm Releases

```bash
# List all Helm releases
GET http://localhost:3000/k8s-images/releases

# List Helm releases in specific namespace
GET http://localhost:3000/k8s-images/releases?namespace=production

# Examples with curl
curl http://localhost:3000/k8s-images/releases
curl "http://localhost:3000/k8s-images/releases?namespace=production"
```

## Direct Node Execution

```bash
# Run the CLI directly (after build)
node dist/cli.js

# Run with ts-node
npx ts-node src/cli.ts
```

## Kubectl and Helm Commands (Used Internally)

The application uses these commands internally:

```bash
# Get all pods
kubectl get pods --all-namespaces -o json
kubectl get pods -n <namespace> -o json

# List Helm releases
helm list --all-namespaces -o json
helm list -n <namespace> -o json
```

You can run these manually to see the raw data that the application processes.

## Configuration

Change the default Helm release name in `package.json`:

```json
{
  "config": {
    "defaultRelease": "enrichment"
  }
}
```

This is used by `npm run export:release` and `npm run export:release:prod` commands.
