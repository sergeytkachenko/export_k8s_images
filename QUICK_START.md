# Quick Start Guide

## Installation and Setup

```bash
# 1. Install dependencies
npm install

# 2. Build the project
npm run build
```

## Running the CLI

### Option A: Run Locally
```bash
# Export all images (development mode)
npm run export

# Export images from default Helm release 'enrichment' (development mode)
npm run export:release

# Production mode (uses compiled JS)
npm run export:prod
npm run export:release:prod
```

### Option B: Install Globally
```bash
# Install globally
npm link

# Run from anywhere - export all images
export-k8s-images

# Export from specific Helm release
export-k8s-images -r my-release

# Export from Helm release in specific namespace
export-k8s-images -r my-release -n production

# Save to custom file
export-k8s-images -r my-release -f custom.txt

# Show help
export-k8s-images --help

# Uninstall
npm unlink -g export_k8s_images
```

### Option C: Offline Export (NEW!)

Export images for air-gapped/offline environments:

```bash
# Export all images for offline use
npm run export:offline

# Export default Helm release
npm run export:offline:release

# Or with global CLI
export-k8s-images-offline -r my-release -o /backup/images
```

This will:
- Pull all images with Docker
- Save as tar.gz archives
- Create load scripts and documentation

### Option D: Run as HTTP Server
```bash
# Start the server
npm run start:dev

# Export list only
curl http://localhost:3000/k8s-images/export

# Export for offline use
curl -X POST "http://localhost:3000/k8s-images/export-offline?release=my-release"

# List all Helm releases
curl http://localhost:3000/k8s-images/releases
```

## What It Does

1. Connects to your Kubernetes cluster via `kubectl`
2. Fetches all pods (optionally filtered by namespace)
3. Filters pods by Helm release label if specified (looks for `app.kubernetes.io/instance`, `release`, or `helm.sh/chart` labels)
4. Extracts all container images from:
   - Regular containers
   - Init containers
   - Ephemeral containers
5. Creates a deduplicated, sorted list
6. Saves to `images.txt` (or custom filename) in the current directory

## Output Example

The `images.txt` file will contain something like:

```
docker.io/library/nginx:1.21.0
docker.io/library/redis:7.0.0
gcr.io/google-samples/hello-app:1.0
k8s.gcr.io/coredns:v1.8.6
quay.io/prometheus/node-exporter:v1.2.2
```

## Prerequisites

- Node.js v16+
- `kubectl` installed and configured
- Active Kubernetes cluster connection

## Troubleshooting

**Error: "kubectl: command not found"**
- Install kubectl: https://kubernetes.io/docs/tasks/tools/

**Error: "The connection to the server localhost:8080 was refused"**
- Configure kubectl to connect to your cluster
- Run: `kubectl config view` to check your configuration

**Error: "No pods found"**
- Verify cluster access: `kubectl get pods --all-namespaces`
- Check your kubeconfig context: `kubectl config current-context`
