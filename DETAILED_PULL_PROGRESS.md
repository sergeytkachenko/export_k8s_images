# Detailed Pull Progress Output

This document shows the detailed output you'll see when running the offline export with detailed Docker pull progress.

## Overview

The offline export now shows **real-time detailed progress** for:
1. **Docker Pull** - Live output from `docker pull` showing layers being downloaded
2. **Docker Save** - File size and duration for each saved image
3. **Progress Indicators** - Current image number out of total

## Example Output

When you run:
```bash
npm run export:offline:release
```

You will see output like this:

```
╔════════════════════════════════════════════════════════════════╗
║         Kubernetes Images - Offline Export Tool               ║
╚════════════════════════════════════════════════════════════════╝

📦 Helm Release: enrichment

[Nest] 12345  - 2024/12/24, 10:30:15     LOG [OfflineExportService] === Starting Complete Offline Export ===
[Nest] 12345  - 2024/12/24, 10:30:15     LOG [OfflineExportService] Step 1/4: Extracting images from Kubernetes...
[Nest] 12345  - 2024/12/24, 10:30:15     LOG [K8sImagesService] Starting Kubernetes images export for Helm release: enrichment...
[Nest] 12345  - 2024/12/24, 10:30:16     LOG [K8sImagesService] Fetching pods from all namespaces...
[Nest] 12345  - 2024/12/24, 10:30:17     LOG [K8sImagesService] Filtered to 15 pods for Helm release: enrichment
[Nest] 12345  - 2024/12/24, 10:30:17     LOG [K8sImagesService] Export completed: 15 pods, 23 containers, 8 unique images
[Nest] 12345  - 2024/12/24, 10:30:17     LOG [OfflineExportService] Found 8 unique images from 15 pods

[Nest] 12345  - 2024/12/24, 10:30:17     LOG [OfflineExportService]
Step 2/4: Pulling Docker images...
[Nest] 12345  - 2024/12/24, 10:30:17     LOG [OfflineExportService] Step 3/4: Saving images to tar.gz files...

[Nest] 12345  - 2024/12/24, 10:30:17     LOG [DockerService] Starting offline export for 8 images to ./k8s-images-offline
[Nest] 12345  - 2024/12/24, 10:30:17     LOG [DockerService] Pulling 8 images...

[1/8] Processing: docker.io/library/nginx:1.21
[Nest] 12345  - 2024/12/24, 10:30:18     LOG [DockerService] Pulling image: docker.io/library/nginx:1.21
[Nest] 12345  - 2024/12/24, 10:30:18     LOG [DockerService]   1.21: Pulling from library/nginx
[Nest] 12345  - 2024/12/24, 10:30:19     LOG [DockerService]   a2abf6c4d29d: Pulling fs layer
[Nest] 12345  - 2024/12/24, 10:30:19     LOG [DockerService]   a9edb18cadd1: Pulling fs layer
[Nest] 12345  - 2024/12/24, 10:30:19     LOG [DockerService]   589b7251471a: Pulling fs layer
[Nest] 12345  - 2024/12/24, 10:30:19     LOG [DockerService]   186b1aaa4aa6: Pulling fs layer
[Nest] 12345  - 2024/12/24, 10:30:19     LOG [DockerService]   b4df32aa5a72: Pulling fs layer
[Nest] 12345  - 2024/12/24, 10:30:19     LOG [DockerService]   a0bcbecc962e: Pulling fs layer
[Nest] 12345  - 2024/12/24, 10:30:20     LOG [DockerService]   a2abf6c4d29d: Downloading [==============>                                    ]  3.5MB/12.2MB
[Nest] 12345  - 2024/12/24, 10:30:20     LOG [DockerService]   a9edb18cadd1: Downloading [========>                                          ]  1.2MB/7.1MB
[Nest] 12345  - 2024/12/24, 10:30:21     LOG [DockerService]   a2abf6c4d29d: Downloading [====================================>              ]  8.9MB/12.2MB
[Nest] 12345  - 2024/12/24, 10:30:21     LOG [DockerService]   a9edb18cadd1: Downloading [========================>                          ]  3.5MB/7.1MB
[Nest] 12345  - 2024/12/24, 10:30:22     LOG [DockerService]   a2abf6c4d29d: Download complete
[Nest] 12345  - 2024/12/24, 10:30:22     LOG [DockerService]   a9edb18cadd1: Download complete
[Nest] 12345  - 2024/12/24, 10:30:22     LOG [DockerService]   589b7251471a: Download complete
[Nest] 12345  - 2024/12/24, 10:30:23     LOG [DockerService]   186b1aaa4aa6: Download complete
[Nest] 12345  - 2024/12/24, 10:30:23     LOG [DockerService]   b4df32aa5a72: Download complete
[Nest] 12345  - 2024/12/24, 10:30:23     LOG [DockerService]   a0bcbecc962e: Download complete
[Nest] 12345  - 2024/12/24, 10:30:24     LOG [DockerService]   a2abf6c4d29d: Extracting [=>                                                 ]  1.3MB/12.2MB
[Nest] 12345  - 2024/12/24, 10:30:24     LOG [DockerService]   a2abf6c4d29d: Extracting [========================================>          ]  9.8MB/12.2MB
[Nest] 12345  - 2024/12/24, 10:30:25     LOG [DockerService]   a2abf6c4d29d: Pull complete
[Nest] 12345  - 2024/12/24, 10:30:25     LOG [DockerService]   a9edb18cadd1: Extracting [==================================================>]  7.1MB/7.1MB
[Nest] 12345  - 2024/12/24, 10:30:25     LOG [DockerService]   a9edb18cadd1: Pull complete
[Nest] 12345  - 2024/12/24, 10:30:25     LOG [DockerService]   589b7251471a: Extracting [==================================================>]  625B/625B
[Nest] 12345  - 2024/12/24, 10:30:25     LOG [DockerService]   589b7251471a: Pull complete
[Nest] 12345  - 2024/12/24, 10:30:25     LOG [DockerService]   186b1aaa4aa6: Extracting [==================================================>]  955B/955B
[Nest] 12345  - 2024/12/24, 10:30:25     LOG [DockerService]   186b1aaa4aa6: Pull complete
[Nest] 12345  - 2024/12/24, 10:30:26     LOG [DockerService]   b4df32aa5a72: Extracting [==================================================>]  393B/393B
[Nest] 12345  - 2024/12/24, 10:30:26     LOG [DockerService]   b4df32aa5a72: Pull complete
[Nest] 12345  - 2024/12/24, 10:30:26     LOG [DockerService]   a0bcbecc962e: Extracting [==================================================>]  1.2kB/1.2kB
[Nest] 12345  - 2024/12/24, 10:30:26     LOG [DockerService]   a0bcbecc962e: Pull complete
[Nest] 12345  - 2024/12/24, 10:30:26     LOG [DockerService]   Digest: sha256:0d17b565c37bcbd895e9d92315a05c1c3c9a29f762b011a10c54a66cd53c9b31
[Nest] 12345  - 2024/12/24, 10:30:26     LOG [DockerService]   Status: Downloaded newer image for nginx:1.21
[Nest] 12345  - 2024/12/24, 10:30:26     LOG [DockerService]   docker.io/library/nginx:1.21
[Nest] 12345  - 2024/12/24, 10:30:26     LOG [DockerService] ✓ Successfully pulled: docker.io/library/nginx:1.21

[2/8] Processing: gcr.io/my-project/backend:v1.2.3
[Nest] 12345  - 2024/12/24, 10:30:27     LOG [DockerService] Pulling image: gcr.io/my-project/backend:v1.2.3
[Nest] 12345  - 2024/12/24, 10:30:27     LOG [DockerService]   v1.2.3: Pulling from my-project/backend
[Nest] 12345  - 2024/12/24, 10:30:28     LOG [DockerService]   e7c96db7181b: Pulling fs layer
[Nest] 12345  - 2024/12/24, 10:30:28     LOG [DockerService]   f910a506b6cb: Pulling fs layer
[Nest] 12345  - 2024/12/24, 10:30:28     LOG [DockerService]   c2274a1a0e27: Pulling fs layer
... (similar progress for remaining layers)
[Nest] 12345  - 2024/12/24, 10:30:45     LOG [DockerService] ✓ Successfully pulled: gcr.io/my-project/backend:v1.2.3

[3/8] Processing: quay.io/prometheus/node-exporter:v1.2.2
... (continues for all images)

[Nest] 12345  - 2024/12/24, 10:32:15     LOG [DockerService]
Pull completed: 8/8 successful
[Nest] 12345  - 2024/12/24, 10:32:15     LOG [DockerService] Saving 8 images to ./k8s-images-offline...

[1/8] docker.io/library/nginx:1.21
[Nest] 12345  - 2024/12/24, 10:32:16     LOG [DockerService] Saving image docker.io/library/nginx:1.21...
[Nest] 12345  - 2024/12/24, 10:32:16     LOG [DockerService]   Output: /path/to/k8s-images-offline/docker.io_library_nginx_1.21.tar.gz
[Nest] 12345  - 2024/12/24, 10:32:16     LOG [DockerService]   Running: docker save docker.io/library/nginx:1.21 | gzip > file
[Nest] 12345  - 2024/12/24, 10:32:28     LOG [DockerService]   ✓ Saved: docker.io_library_nginx_1.21.tar.gz (54.32 MB in 12.45s)

[2/8] gcr.io/my-project/backend:v1.2.3
[Nest] 12345  - 2024/12/24, 10:32:28     LOG [DockerService] Saving image gcr.io/my-project/backend:v1.2.3...
[Nest] 12345  - 2024/12/24, 10:32:28     LOG [DockerService]   Output: /path/to/k8s-images-offline/gcr.io_my-project_backend_v1.2.3.tar.gz
[Nest] 12345  - 2024/12/24, 10:32:28     LOG [DockerService]   Running: docker save gcr.io/my-project/backend:v1.2.3 | gzip > file
[Nest] 12345  - 2024/12/24, 10:32:42     LOG [DockerService]   ✓ Saved: gcr.io_my-project_backend_v1.2.3.tar.gz (123.45 MB in 14.23s)

... (continues for all images)

[Nest] 12345  - 2024/12/24, 10:34:15     LOG [DockerService]
Save completed: 8/8 successful
[Nest] 12345  - 2024/12/24, 10:34:15     LOG [OfflineExportService] Step 4/4: Creating helper scripts and documentation...
[Nest] 12345  - 2024/12/24, 10:34:15     LOG [DockerService] Created load script: /path/to/k8s-images-offline/load-images.sh
[Nest] 12345  - 2024/12/24, 10:34:15     LOG [DockerService] Created README: /path/to/k8s-images-offline/README.md
[Nest] 12345  - 2024/12/24, 10:34:15     LOG [OfflineExportService] === Offline Export Complete ===
[Nest] 12345  - 2024/12/24, 10:34:15     LOG [OfflineExportService] Output Directory: /path/to/k8s-images-offline
[Nest] 12345  - 2024/12/24, 10:34:15     LOG [OfflineExportService] Kubernetes Pods: 15
[Nest] 12345  - 2024/12/24, 10:34:15     LOG [OfflineExportService] Kubernetes Containers: 23
[Nest] 12345  - 2024/12/24, 10:34:15     LOG [OfflineExportService] Unique Images: 8
[Nest] 12345  - 2024/12/24, 10:34:15     LOG [OfflineExportService] Successfully Saved: 8
[Nest] 12345  - 2024/12/24, 10:34:15     LOG [OfflineExportService] Failed Pulls: 0
[Nest] 12345  - 2024/12/24, 10:34:15     LOG [OfflineExportService] Failed Saves: 0

╔════════════════════════════════════════════════════════════════╗
║                     Export Complete!                           ║
╚════════════════════════════════════════════════════════════════╝

📊 Statistics:
   • Kubernetes Pods: 15
   • Containers: 23
   • Unique Images: 8
   • Successfully Pulled: 8
   • Successfully Saved: 8

📁 Output Location:
   /path/to/k8s-images-offline

📄 Files Created:
   • *.tar.gz - Docker image archives
   • load-images.sh - Script to load all images
   • README.md - Detailed instructions
   • images.txt - List of all images

🚀 Next Steps:
   1. Copy the directory to your offline environment
   2. Run: cd ./k8s-images-offline
   3. Run: ./load-images.sh

✅ All images are ready for offline use!
```

## Key Features in Detailed Output

### 1. Docker Pull Progress
Shows real-time output from Docker including:
- **Layers being pulled** - Each layer ID (e.g., `a2abf6c4d29d`)
- **Download progress** - Progress bars for each layer
- **Download completion** - When each layer finishes downloading
- **Extraction progress** - Progress bars for extracting layers
- **Image digest** - SHA256 hash of the image
- **Status messages** - Overall pull status

### 2. Docker Save Progress
Shows for each image:
- **Output filename** - Full path to the tar.gz file
- **File size** - Size in MB after compression
- **Duration** - Time taken to save and compress
- **Progress indicator** - Current image number (e.g., `[3/8]`)

### 3. Progress Counters
- `[1/8] Processing: <image-name>` - Shows current progress through the list
- Separators between each image for easy reading
- Summary totals at the end of each phase

## What You See for Each Image

### Pull Phase
```
[1/8] Processing: docker.io/library/nginx:1.21
Pulling image: docker.io/library/nginx:1.21
  1.21: Pulling from library/nginx
  a2abf6c4d29d: Pulling fs layer
  a9edb18cadd1: Pulling fs layer
  ...
  a2abf6c4d29d: Downloading [==============>        ]  3.5MB/12.2MB
  ...
  a2abf6c4d29d: Download complete
  a2abf6c4d29d: Extracting [=>                     ]  1.3MB/12.2MB
  ...
  a2abf6c4d29d: Pull complete
  ...
  Status: Downloaded newer image for nginx:1.21
✓ Successfully pulled: docker.io/library/nginx:1.21
```

### Save Phase
```
[1/8] docker.io/library/nginx:1.21
Saving image docker.io/library/nginx:1.21...
  Output: /path/to/k8s-images-offline/docker.io_library_nginx_1.21.tar.gz
  Running: docker save docker.io/library/nginx:1.21 | gzip > file
  ✓ Saved: docker.io_library_nginx_1.21.tar.gz (54.32 MB in 12.45s)
```

## Performance Information

The detailed output helps you track:
- **Download speed** - See progress bars updating in real-time
- **Time per image** - Duration shown for each save operation
- **File sizes** - Compressed size in MB for capacity planning
- **Overall progress** - Know how many images are left

## Error Reporting

If an image fails, you'll see:
```
[3/8] Processing: private-registry/app:broken
Pulling image: private-registry/app:broken
  Error response from daemon: manifest for private-registry/app:broken not found
✗ Failed to pull private-registry/app:broken (exit code: 1)
```

And at the end:
```
⚠️  Failed Pulls (1):
   • private-registry/app:broken
```

## Comparison: Quick vs Detailed Mode

| Feature | Quick Mode | Detailed Mode |
|---------|-----------|---------------|
| Layer progress | ❌ | ✅ |
| Download bars | ❌ | ✅ |
| Extraction progress | ❌ | ✅ |
| File sizes | ✅ | ✅ |
| Duration timings | ❌ | ✅ |
| Image digest | ❌ | ✅ |
| Save command shown | ❌ | ✅ |

## When to Use

**Use Detailed Progress (default) when:**
- You want to monitor download progress
- You're troubleshooting slow downloads
- You want to see exactly what Docker is doing
- You're exporting many large images

**Use Quick Mode when:**
- You just want a summary
- Running in automated scripts
- Logging to files (less verbose logs)

To disable detailed progress in code, set `showProgress: false` in the options.
