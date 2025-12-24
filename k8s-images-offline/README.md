# Kubernetes Images - Offline Export

This directory contains Docker images exported for offline use.

## Export Information

- **Total Images**: 6
- **Successfully Pulled**: 6
- **Successfully Saved**: 6
- **Export Date**: 2025-12-24T14:19:12.861Z




## How to Load Images

### Option 1: Use the provided script (Linux/Mac)

```bash
chmod +x load-images.sh
./load-images.sh
```

### Option 2: Load manually

Load individual images:

```bash
gunzip -c image-name.tar.gz | docker load
```

Load all images:

```bash
for file in *.tar.gz; do gunzip -c "$file" | docker load; done
```

### Option 3: Windows (PowerShell)

```powershell
Get-ChildItem -Filter *.tar.gz | ForEach-Object {
    Write-Host "Loading $($_.Name)..."
    & docker load -i $_.FullName
}
```

## Files

Each `.tar.gz` file contains a complete Docker image that can be loaded with `docker load`.

## Verification

After loading, verify images are available:

```bash
docker images
```
