# Helm Release Filtering

This document explains how to filter Kubernetes images by Helm release.

## Overview

The tool can filter pods by Helm release name using standard Helm labels. This is useful when you want to export images only from a specific application or microservice deployed via Helm.

## How It Works

The tool looks for these standard Helm labels on pods:
- `app.kubernetes.io/instance` (Helm v3 standard)
- `release` (legacy label)
- `helm.sh/chart` (alternative label)

When you specify a Helm release name, the tool filters pods to only include those with matching labels.

## Usage

### CLI

```bash
# Export images from a specific Helm release
export-k8s-images -r my-release

# Export images from a Helm release in a specific namespace
export-k8s-images -r my-release -n production

# Use the default Helm release from package.json ('enrichment')
npm run export:release
```

### HTTP API

```bash
# Export images from a specific Helm release
curl "http://localhost:3000/k8s-images/export?release=my-release"

# Export from Helm release in specific namespace
curl "http://localhost:3000/k8s-images/export?release=my-release&namespace=production"

# List all available Helm releases
curl http://localhost:3000/k8s-images/releases

# List Helm releases in specific namespace
curl "http://localhost:3000/k8s-images/releases?namespace=production"
```

## Default Helm Release

The default Helm release name is configured in `package.json`:

```json
{
  "config": {
    "defaultRelease": "enrichment"
  }
}
```

You can change this value to match your primary Helm release name.

## NPM Scripts

```bash
# Export using default Helm release (development)
npm run export:release

# Export using default Helm release (production)
npm run export:release:prod
```

These scripts automatically use the `defaultRelease` value from `package.json`.

## Finding Your Helm Releases

To see all Helm releases in your cluster:

```bash
# List all releases
helm list --all-namespaces

# List releases in specific namespace
helm list -n production
```

Or use the API:

```bash
curl http://localhost:3000/k8s-images/releases
```

## Example Workflow

1. List available Helm releases:
```bash
helm list -n production
```

Output:
```
NAME            NAMESPACE       REVISION        STATUS          CHART
enrichment      production      3               deployed        enrichment-1.0.0
monitoring      production      1               deployed        prometheus-15.0.0
```

2. Export images from specific release:
```bash
export-k8s-images -r enrichment -n production
```

3. The tool will:
   - Fetch all pods in the `production` namespace
   - Filter pods with label `app.kubernetes.io/instance=enrichment`
   - Extract all container images from matching pods
   - Save to `images.txt`

## Troubleshooting

**No pods found**

If the tool reports no pods found when filtering by Helm release:

1. Verify the Helm release exists:
   ```bash
   helm list --all-namespaces | grep my-release
   ```

2. Check pod labels:
   ```bash
   kubectl get pods -n <namespace> --show-labels | grep my-release
   ```

3. Ensure you're using the correct namespace:
   ```bash
   helm list --all-namespaces
   ```

**Partial results**

If you're getting fewer images than expected:

- The tool uses label matching, so pods must have standard Helm labels
- Some pods might be part of the release but have different labels
- Check if all pods have the expected labels:
  ```bash
  kubectl get pods -n <namespace> -l app.kubernetes.io/instance=<release-name>
  ```
