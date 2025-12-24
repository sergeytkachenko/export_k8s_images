import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { K8sImagesController } from './k8s-images.controller';
import { K8sImagesService } from './k8s-images.service';
import { DockerService } from './docker.service';
import { OfflineExportService } from './offline-export.service';
import { DockerComposeService } from './docker-compose.service';
import { ComposeOfflineExportService } from './compose-offline-export.service';
import { TrivyService } from './trivy.service';

@Module({
  imports: [],
  controllers: [AppController, K8sImagesController],
  providers: [
    AppService,
    K8sImagesService,
    DockerService,
    OfflineExportService,
    DockerComposeService,
    ComposeOfflineExportService,
    TrivyService,
  ],
})
export class AppModule {}
