<p align="center">
  <h1 align="center">🚀 Kubernetes & Docker Compose Image Export Tool</h1>
  <p align="center">
    <strong>A powerful NestJS application for exporting, backing up, and securing container images</strong>
  </p>
</p>

<p align="center">
  <a href="https://github.com/sergeytkachenko/export_k8s_images/stargazers"><img src="https://img.shields.io/github/stars/sergeytkachenko/export_k8s_images?style=flat-square" alt="Stars"></a>
  <a href="https://github.com/sergeytkachenko/export_k8s_images/network/members"><img src="https://img.shields.io/github/forks/sergeytkachenko/export_k8s_images?style=flat-square" alt="Forks"></a>
  <a href="https://github.com/sergeytkachenko/export_k8s_images/issues"><img src="https://img.shields.io/github/issues/sergeytkachenko/export_k8s_images?style=flat-square" alt="Issues"></a>
  <a href="https://github.com/sergeytkachenko/export_k8s_images/blob/main/LICENSE"><img src="https://img.shields.io/github/license/sergeytkachenko/export_k8s_images?style=flat-square" alt="License"></a>
</p>

<p align="center">
  <a href="https://nestjs.com/"><img src="https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" alt="NestJS"></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript"></a>
  <a href="https://kubernetes.io/"><img src="https://img.shields.io/badge/Kubernetes-326CE5?style=for-the-badge&logo=kubernetes&logoColor=white" alt="Kubernetes"></a>
  <a href="https://www.docker.com/"><img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker"></a>
  <a href="https://helm.sh/"><img src="https://img.shields.io/badge/Helm-0F1689?style=for-the-badge&logo=helm&logoColor=white" alt="Helm"></a>
</p>

---

## 📋 Table of Contents

- [✨ Features](#-features)
- [🎯 Use Cases](#-use-cases)
- [🚀 Quick Start](#-quick-start)
- [📦 Installation](#-installation)
- [💻 Usage](#-usage)
  - [CLI Tools](#cli-tools)
  - [HTTP API](#http-api)
  - [NPM Scripts](#npm-scripts)
- [🔒 Security Scanning](#-security-scanning)
- [📖 Documentation](#-documentation)
- [🛠️ Prerequisites](#️-prerequisites)
- [🏗️ Architecture](#️-architecture)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

---

## ✨ Features

### Core Capabilities
- 🔍 **Kubernetes Image Extraction** - Extract all container images from running pods
- 🎯 **Helm Release Filtering** - Filter by Helm release name and namespace
- 🐳 **Docker Compose Support** - Export images from docker-compose.yml files
- 📦 **Offline Export** - Pull images and save as compressed tar.gz archives
- 🔒 **Vulnerability Scanning** - Scan images with Trivy for CRITICAL and HIGH severity vulnerabilities (enabled by default)
- 🗜️ **Automatic Compression** - Reduce storage with gzip compression
- 🔨 **Build Support** - Automatically build docker-compose services
- 📝 **Helper Scripts** - Generate load scripts for offline environments
- 🌐 **Multiple Interfaces** - CLI tools, HTTP API, and npm scripts
- ⚡ **Real-time Progress** - Detailed progress tracking for pull/save operations

### Advanced Features
- 🔐 **Security-First** - Vulnerability scanning enabled by default
- 📊 **Detailed Reports** - JSON and text vulnerability reports
- 🎨 **Beautiful CLI Output** - Colored, formatted terminal output
- 🚄 **Fast Performance** - Parallel operations where possible
- 📂 **Organized Exports** - Clean directory structure with documentation

---

## 🎯 Use Cases

### Perfect for:
- 🏢 **Air-gapped Environments** - Export images for offline/disconnected systems
- 🔄 **Disaster Recovery** - Backup critical container images
- 🔐 **Security Audits** - Scan production images for vulnerabilities
- 🚚 **Migration Projects** - Move images between registries/clusters
- 📋 **Compliance** - Document and audit container image usage
- 🧪 **Testing** - Create reproducible test environments
- 💾 **Archival** - Long-term storage of container images

---

## 🚀 Quick Start

Get started in 3 simple steps:

### 1️⃣ Install Dependencies
```bash
npm install
npm run build
npm link
```

### 2️⃣ Export Kubernetes Images
```bash
# Export all images from all pods
export-k8s-images-offline

# Export from specific Helm release
export-k8s-images-offline -r my-release

# Export without vulnerability scanning
export-k8s-images-offline -r my-release --no-scan
```

### 3️⃣ Export Docker Compose Images
```bash
# Export from docker-compose.yml
export-compose-images-offline

# Export with building services
export-compose-images-offline -f docker-compose.yml -b
```

**✅ That's it!** Your images are now ready for offline use in the export directory.

---

## 📦 Installation

### Prerequisites
Ensure you have the following installed:

#### Required
- ✅ **Node.js** v16 or higher
- ✅ **kubectl** - Configured with cluster access
- ✅ **Docker** - Running and accessible
- ✅ **Trivy** - For vulnerability scanning ([Installation Guide](https://github.com/aquasecurity/trivy#installation))

#### Optional
- ⭕ **Helm** - For Helm release filtering
- ⭕ **docker-compose** - For Docker Compose exports

### Install the Tool

#### Option 1: Global Installation (Recommended)
```bash
# Clone the repository
git clone https://github.com/sergeytkachenko/export_k8s_images.git
cd export_k8s_images

# Install dependencies
npm install

# Build the project
npm run build

# Link globally
npm link
```

Now you can use the CLI tools from anywhere:
```bash
export-k8s-images
export-k8s-images-offline
export-compose-images-offline
```

#### Option 2: Local Usage
```bash
# Clone and install
git clone https://github.com/sergeytkachenko/export_k8s_images.git
cd export_k8s_images
npm install

# Use npm scripts
npm run export
npm run export:offline
npm run export:compose
```

#### Option 3: Run as HTTP API
```bash
# Start the server
npm run start:dev

# Server runs on http://localhost:3000
```

---

## 💻 Usage

### CLI Tools

#### 📋 List Export (images.txt only)

**export-k8s-images** - Export image list to a text file

```bash
# Export all images to images.txt
export-k8s-images

# Export from Helm release
export-k8s-images -r my-release

# Export from Helm release in namespace
export-k8s-images -r my-release -n production

# Export to custom file
export-k8s-images -r my-release -f custom.txt
```

**Options:**
```
-r, --release <name>     Filter by Helm release name
-n, --namespace <name>   Filter by Kubernetes namespace
-f, --file <filename>    Output filename (default: images.txt)
-h, --help              Show help message
```

---

#### 📦 Offline Export - Kubernetes

**export-k8s-images-offline** - Complete offline export workflow

```bash
# Export all images for offline use (with vulnerability scan)
export-k8s-images-offline

# Export from Helm release
export-k8s-images-offline -r my-release

# Export from Helm release in namespace
export-k8s-images-offline -r my-release -n production

# Custom output directory
export-k8s-images-offline -r my-release -o /backup/images

# Disable vulnerability scanning
export-k8s-images-offline -r my-release --no-scan
```

**Options:**
```
-r, --release <name>     Filter by Helm release name
-n, --namespace <name>   Filter by Kubernetes namespace
-o, --output <dir>       Output directory (default: ./k8s-images-offline)
-s, --scan              Scan for CRITICAL & HIGH vulnerabilities (default: enabled)
--no-scan               Disable vulnerability scanning
-h, --help              Show help message
```

**What You Get:**
```
k8s-images-offline/
├── *.tar.gz                      # Compressed Docker images
├── images.txt                    # List of all images
├── load-images.sh                # Script to load all images (Linux/Mac)
├── README.md                     # Instructions for offline use
├── vulnerability_scan.txt        # CRITICAL & HIGH vulnerabilities
└── vulnerability_summary.json    # Vulnerability summary
```

---

#### 🐳 Offline Export - Docker Compose

**export-compose-images-offline** - Export Docker Compose images

```bash
# Export from default docker-compose.yml
export-compose-images-offline

# Export from specific file
export-compose-images-offline -f /path/to/docker-compose.yml

# Export with building services
export-compose-images-offline -f docker-compose.yml -b

# Custom output directory
export-compose-images-offline -f docker-compose.yml -o /backup/compose

# Disable vulnerability scanning
export-compose-images-offline -f docker-compose.yml --no-scan
```

**Options:**
```
-f, --file <path>        Path to docker-compose.yml (default: ./docker-compose.yml)
-o, --output <dir>       Output directory (default: ./docker-compose-images-offline)
-b, --build             Build services before exporting
-s, --scan              Scan for CRITICAL & HIGH vulnerabilities (default: enabled)
--no-scan               Disable vulnerability scanning
-h, --help              Show help message
```

---

### HTTP API

Start the server:
```bash
npm run start:dev
```

The API runs on `http://localhost:3000`

#### Endpoints

##### List Kubernetes Images
```bash
GET /k8s-images/export
GET /k8s-images/export?release=my-release
GET /k8s-images/export?release=my-release&namespace=production
```

##### Offline Export - Kubernetes
```bash
POST /k8s-images/export-offline
POST /k8s-images/export-offline?release=my-release
POST /k8s-images/export-offline?release=my-release&scanVulnerabilities=true
```

##### Offline Export - Docker Compose
```bash
POST /k8s-images/export-compose-offline?composePath=docker-compose.yml
POST /k8s-images/export-compose-offline?composePath=docker-compose.yml&buildIfNeeded=true
POST /k8s-images/export-compose-offline?composePath=docker-compose.yml&scanVulnerabilities=true
```

##### List Helm Releases
```bash
GET /k8s-images/releases
GET /k8s-images/releases?namespace=production
```

**Examples with curl:**
```bash
# Export images
curl http://localhost:3000/k8s-images/export

# Offline export with scan
curl -X POST "http://localhost:3000/k8s-images/export-offline?release=my-release&scanVulnerabilities=true"

# Docker Compose export
curl -X POST "http://localhost:3000/k8s-images/export-compose-offline?composePath=docker-compose.yml"
```

---

### NPM Scripts

#### Build & Development
```bash
npm run build              # Build the project
npm run format             # Format code with Prettier
npm run lint               # Lint and fix TypeScript files
npm run start              # Start in normal mode
npm run start:dev          # Start in watch mode (auto-reload)
npm run start:prod         # Start production build
```

#### Export Commands
```bash
# List export
npm run export             # Export all images to images.txt
npm run export:release     # Export from default Helm release

# Offline export (K8s)
npm run export:offline                # Export all images for offline use
npm run export:offline:release        # Export default Helm release for offline

# Offline export (Docker Compose)
npm run export:compose                # Export from docker-compose.yml
npm run export:compose:build          # Export with building services
```

---

## 🔒 Security Scanning

### Trivy Integration

This tool integrates **Trivy** for vulnerability scanning, focusing on **CRITICAL** and **HIGH** severity issues.

#### Enabled by Default
Vulnerability scanning is **enabled by default** for all offline exports:
```bash
# Scanning happens automatically
export-k8s-images-offline -r my-release
```

#### Disable Scanning
Use `--no-scan` if Trivy is not available:
```bash
export-k8s-images-offline -r my-release --no-scan
```

#### Scan Output

**Console Output:**
```
🔒 Vulnerability Scan (CRITICAL & HIGH):
   • CRITICAL: 3
   • HIGH: 12
```

**Files Created:**
- `vulnerability_scan.txt` - Detailed report with all findings
- `vulnerability_summary.json` - JSON summary with counts by severity

**Example vulnerability_summary.json:**
```json
{
  "totalImagesScanned": 15,
  "successfulScans": 15,
  "failedScans": 0,
  "totalCritical": 3,
  "totalHigh": 12,
  "totalMedium": 0,
  "totalLow": 0,
  "reportFile": "vulnerability_scan.txt",
  "scanResults": [...]
}
```

---

## 📖 Documentation

Comprehensive guides for all features:

- 📘 [**COMMANDS.md**](COMMANDS.md) - Complete command reference
- 📗 [**OFFLINE_EXPORT.md**](OFFLINE_EXPORT.md) - Offline export detailed guide
- 📙 [**DOCKER_COMPOSE_EXPORT.md**](DOCKER_COMPOSE_EXPORT.md) - Docker Compose export guide
- 📕 [**HELM_FILTERING.md**](HELM_FILTERING.md) - Helm release filtering guide
- 📔 [**DETAILED_PULL_PROGRESS.md**](DETAILED_PULL_PROGRESS.md) - Progress output examples
- 📓 [**QUICK_START.md**](QUICK_START.md) - Quick reference guide

---

## 🛠️ Prerequisites

### System Requirements

| Component | Required | Notes |
|-----------|----------|-------|
| **Node.js** | ✅ Yes | v16 or higher |
| **kubectl** | ✅ Yes | Configured with cluster access |
| **Docker** | ✅ Yes | Running and accessible |
| **Trivy** | ⚠️ Recommended | Required for vulnerability scanning (enabled by default) |
| **Helm** | ⭕ Optional | Only for Helm release filtering |
| **docker-compose** | ⭕ Optional | Only for Docker Compose exports |

### Disk Space Requirements

Estimate disk space needed:
- **Small deployment** (10 images): ~5-10 GB
- **Medium deployment** (50 images): ~20-50 GB
- **Large deployment** (100+ images): ~50-200 GB

💡 **Tip:** Use `kubectl get pods --all-namespaces -o jsonpath='{range .items[*]}{.spec.containers[*].image}{"\n"}{end}' | sort -u | wc -l` to count unique images.

---

## 🏗️ Architecture

### Project Structure

```
export_k8s_images/
├── src/
│   ├── app.module.ts                    # Main application module
│   ├── k8s-images.service.ts            # Kubernetes image extraction
│   ├── k8s-images.controller.ts         # HTTP API endpoints
│   ├── docker.service.ts                # Docker pull/save operations
│   ├── docker-compose.service.ts        # Docker Compose parsing
│   ├── trivy.service.ts                 # Vulnerability scanning
│   ├── offline-export.service.ts        # K8s offline workflow
│   ├── compose-offline-export.service.ts # Compose offline workflow
│   ├── cli.ts                           # CLI: List export
│   ├── cli-offline.ts                   # CLI: K8s offline export
│   └── cli-compose-offline.ts           # CLI: Compose offline export
├── test/                                # Tests
├── docs/                                # Documentation
└── package.json                         # Dependencies and scripts
```

### Service Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLI / HTTP API                        │
└───────────────────────────┬─────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
┌───────────────┐   ┌──────────────┐   ┌──────────────┐
│ K8s Images    │   │ Docker       │   │ Trivy        │
│ Service       │   │ Service      │   │ Service      │
└───────┬───────┘   └──────┬───────┘   └──────┬───────┘
        │                   │                   │
        │                   │                   │
        ▼                   ▼                   ▼
┌───────────────┐   ┌──────────────┐   ┌──────────────┐
│ kubectl       │   │ docker       │   │ trivy        │
│ helm          │   │ gzip         │   │              │
└───────────────┘   └──────────────┘   └──────────────┘
```

### Workflow: Offline Export

```
1. Extract Images
   └─> kubectl get pods → Parse JSON → Extract images

2. Pull Images
   └─> docker pull → Real-time progress → Success/Failure

3. Save Images
   └─> docker save → gzip → .tar.gz files

4. Scan Vulnerabilities (optional)
   └─> trivy scan → Parse results → Generate reports

5. Create Helper Files
   └─> load-images.sh → README.md → Complete!
```

---

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

### Ways to Contribute
- 🐛 Report bugs
- 💡 Suggest new features
- 📝 Improve documentation
- 🔧 Submit pull requests
- ⭐ Star the repository

### Development Setup

1. **Fork and clone**
   ```bash
   git clone https://github.com/YOUR_USERNAME/export_k8s_images.git
   cd export_k8s_images
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create a branch**
   ```bash
   git checkout -b feature/my-new-feature
   ```

4. **Make changes and test**
   ```bash
   npm run build
   npm run test
   ```

5. **Commit and push**
   ```bash
   git add .
   git commit -m "Add my new feature"
   git push origin feature/my-new-feature
   ```

6. **Create Pull Request**
   - Go to GitHub and create a PR from your branch

### Coding Standards
- ✅ Use TypeScript
- ✅ Follow NestJS conventions
- ✅ Add tests for new features
- ✅ Update documentation
- ✅ Run `npm run lint` and `npm run format`

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

Built with these amazing technologies:

- [NestJS](https://nestjs.com/) - Progressive Node.js framework
- [TypeScript](https://www.typescriptlang.org/) - Typed JavaScript
- [Kubernetes](https://kubernetes.io/) - Container orchestration
- [Docker](https://www.docker.com/) - Containerization platform
- [Helm](https://helm.sh/) - Kubernetes package manager
- [Trivy](https://github.com/aquasecurity/trivy) - Vulnerability scanner

---

## 📞 Support

- 📧 **Issues**: [GitHub Issues](https://github.com/sergeytkachenko/export_k8s_images/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/sergeytkachenko/export_k8s_images/discussions)
- 📖 **Documentation**: See the `/docs` folder

---

## ⭐ Show Your Support

If this project helped you, please consider giving it a ⭐ star on [GitHub](https://github.com/sergeytkachenko/export_k8s_images)!

---

<p align="center">
  Made with ❤️ by <a href="https://github.com/sergeytkachenko">Sergey Tkachenko</a>
</p>

<p align="center">
  <sub>🤖 Enhanced with <a href="https://claude.com/claude-code">Claude Code</a></sub>
</p>
