<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

A NestJS application that extracts all container images from Kubernetes pods and saves them to a file. This tool uses `kubectl` to fetch all pods across all namespaces and extracts the image names from all containers (including init containers and ephemeral containers).

**New Feature**: Full offline export capability - pull Docker images and save as tar.gz files for air-gapped/offline environments!

## Features

- 🔍 Extract images from Kubernetes pods (all namespaces or filtered)
- 🎯 Filter by Helm release name
- 🐳 **Docker Compose Support**: Export images from docker-compose.yml files
- 📦 **Offline Export**: Pull images with Docker and save as tar.gz archives
- 🔒 **Vulnerability Scanning**: Scan images with Trivy for CRITICAL and HIGH severity vulnerabilities (enabled by default)
- 🗜️ Automatic compression using gzip
- 🔨 Build docker-compose services automatically
- 📝 Generate helper scripts for loading images offline
- 🌐 HTTP API and CLI interfaces
- ⚙️ Configurable output directories and filenames

## Prerequisites

### Basic Features
- Node.js (v16 or higher)
- `kubectl` installed and configured
- Access to a Kubernetes cluster

### Offline Export (Additional)
- `Docker` installed and running
- Sufficient disk space for image downloads

### Docker Compose Export (Additional)
- `docker-compose` installed
- Valid `docker-compose.yml` file

### Vulnerability Scanning (Enabled by Default)
- `Trivy` installed (scans for CRITICAL and HIGH severity vulnerabilities - required by default)
- Installation: https://github.com/aquasecurity/trivy#installation
- Use `--no-scan` flag to disable if Trivy is not available

## Project setup

```bash
$ npm install
```

## Configuration

The default Helm release name is configured in `package.json`:

```json
{
  "config": {
    "defaultRelease": "enrichment"
  }
}
```

You can change this value to match your Helm release name. This is used by the `npm run export:release` command.

## Usage

### Method 1: Global CLI Installation (Recommended)

Install globally and use as a command-line tool:

```bash
# Build and install globally
$ npm run build
$ npm link

# Now you can run from anywhere
$ export-k8s-images
```

To uninstall:
```bash
$ npm unlink -g export_k8s_images
```

### Method 2: Local CLI Command

Export Kubernetes images directly using npm scripts:

```bash
# Export all images from all pods
$ npm run export

# Export images from default Helm release (configured in package.json as 'enrichment')
$ npm run export:release

# Or after building (production)
$ npm run build
$ npm run export:prod
$ npm run export:release:prod
```

#### CLI Options

```bash
# Export all images
$ export-k8s-images

# Export images from a specific Helm release
$ export-k8s-images -r my-release
$ export-k8s-images --release my-release

# Export images from a specific namespace
$ export-k8s-images -n production
$ export-k8s-images --namespace production

# Export images from a Helm release in a specific namespace
$ export-k8s-images -r my-release -n production

# Save to a custom filename
$ export-k8s-images -r my-release -f my-images.txt

# Show help
$ export-k8s-images --help
```

This will:
1. Connect to your Kubernetes cluster using `kubectl`
2. Fetch all pods (optionally filtered by namespace)
3. Filter pods by Helm release label if specified
4. Extract all container images (including init and ephemeral containers)
5. Save unique images to the specified file (default: `images.txt`)
6. Display a summary in the console

### Method 3: HTTP API

Start the NestJS server and use the HTTP endpoint:

```bash
# Start in development mode
$ npm run start:dev

# Or start in production mode
$ npm run build
$ npm run start:prod
```

Then make a GET request to export images:

```bash
# Export all images
$ curl http://localhost:3000/k8s-images/export

# Export images from a specific Helm release
$ curl "http://localhost:3000/k8s-images/export?release=my-release"

# Export images from a specific Helm release in a namespace
$ curl "http://localhost:3000/k8s-images/export?release=my-release&namespace=production"

# Export to a custom filename
$ curl "http://localhost:3000/k8s-images/export?release=my-release&filename=custom.txt"

# List all Helm releases
$ curl http://localhost:3000/k8s-images/releases

# List Helm releases in a specific namespace
$ curl "http://localhost:3000/k8s-images/releases?namespace=production"
```

The API will return a JSON response with statistics and save the images to the specified file.

### Method 4: Offline Export (NEW! 📦)

**Export images for offline/air-gapped environments** - pulls images with Docker and saves as tar.gz files.

#### NPM Scripts

```bash
# Export all images for offline use
$ npm run export:offline

# Export from default Helm release 'enrichment'
$ npm run export:offline:release

# Production mode
$ npm run build
$ npm run export:offline:prod
$ npm run export:offline:release:prod
```

#### Global CLI

```bash
# Export all images
$ export-k8s-images-offline

# Export from specific Helm release
$ export-k8s-images-offline -r my-release

# Export from Helm release in namespace
$ export-k8s-images-offline -r my-release -n production

# Custom output directory
$ export-k8s-images-offline -r my-release -o /backup/images

# Scan for vulnerabilities with Trivy (enabled by default)
$ export-k8s-images-offline -r my-release

# Disable vulnerability scanning
$ export-k8s-images-offline -r my-release --no-scan

# Show help
$ export-k8s-images-offline --help
```

#### HTTP API

```bash
# Trigger offline export
$ curl -X POST "http://localhost:3000/k8s-images/export-offline"

# With Helm release filter
$ curl -X POST "http://localhost:3000/k8s-images/export-offline?release=my-release&namespace=production"
```

#### What You Get

The offline export creates a directory with:
- `*.tar.gz` - Compressed Docker images
- `load-images.sh` - Script to load all images (Linux/Mac)
- `README.md` - Instructions for offline use
- `images.txt` - List of all images
- `vulnerability_scan.txt` - CRITICAL & HIGH vulnerabilities report (enabled by default)
- `vulnerability_summary.json` - Vulnerability summary (enabled by default)

#### Loading in Offline Environment

```bash
cd k8s-images-offline
chmod +x load-images.sh
./load-images.sh
```

Or manually:
```bash
gunzip -c image-name.tar.gz | docker load
```

**📖 See [OFFLINE_EXPORT.md](OFFLINE_EXPORT.md) for complete guide**
**🔍 See [DETAILED_PULL_PROGRESS.md](DETAILED_PULL_PROGRESS.md) for detailed progress output**

### Method 5: Docker Compose Export (NEW! 🐳)

**Export images from docker-compose.yml** files - supports both pre-built images and services that need building.

#### NPM Scripts

```bash
# Export from default docker-compose.yml
$ npm run export:compose

# Export with building services (for 'build:' directives)
$ npm run export:compose:build

# Production mode
$ npm run build
$ npm run export:compose:prod
$ npm run export:compose:build:prod
```

#### Global CLI

```bash
# Export from default docker-compose.yml
$ export-compose-images-offline

# Export from specific file
$ export-compose-images-offline -f /path/to/docker-compose.yml

# Export with building services
$ export-compose-images-offline -f docker-compose.yml -b

# Custom output directory
$ export-compose-images-offline -f docker-compose.yml -o /backup/compose-images

# Scan for vulnerabilities with Trivy (enabled by default)
$ export-compose-images-offline -f docker-compose.yml

# Disable vulnerability scanning
$ export-compose-images-offline -f docker-compose.yml --no-scan

# Show help
$ export-compose-images-offline --help
```

#### HTTP API

```bash
# Export images list from compose file
$ curl -X POST "http://localhost:3000/k8s-images/export-compose?composePath=docker-compose.yml"

# Offline export with build
$ curl -X POST "http://localhost:3000/k8s-images/export-compose-offline?composePath=docker-compose.yml&buildIfNeeded=true"
```

#### What You Get

The docker-compose export creates:
- `*.tar.gz` - Compressed Docker images (from both `image:` and `build:` services)
- `load-images.sh` - Script to load all images
- `README.md` - Instructions for offline use
- `docker-compose-images.txt` - List of all images
- `vulnerability_scan.txt` - CRITICAL & HIGH vulnerabilities report (enabled by default)
- `vulnerability_summary.json` - Vulnerability summary (enabled by default)

#### Example docker-compose.yml

```yaml
services:
  nginx:
    image: nginx:1.21  # Pre-built image from registry

  backend:
    build: ./backend   # Built from Dockerfile (use -b flag)

  redis:
    image: redis:7.0   # Pre-built image from registry
```

**📖 See [DOCKER_COMPOSE_EXPORT.md](DOCKER_COMPOSE_EXPORT.md) for complete guide**

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Output

The tool generates an `images.txt` file in the project root containing a sorted list of unique container images, for example:

```
docker.io/library/nginx:1.21
gcr.io/google-samples/hello-app:1.0
k8s.gcr.io/kube-proxy:v1.22.0
quay.io/prometheus/node-exporter:v1.2.2
```

## Project Structure

```
src/
├── app.controller.ts         # Default NestJS controller
├── app.module.ts             # Main application module
├── app.service.ts            # Default NestJS service
├── cli.ts                    # CLI entry point for exporting images
├── k8s-images.controller.ts  # HTTP API controller
├── k8s-images.service.ts     # Core service with kubectl logic
└── main.ts                   # HTTP server entry point
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
