import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { DocumentsService } from './services/documents.service';
import { DocumentUploadService } from './services/document-upload.service';
import { DocumentGeneratorService } from './services/document-generator.service';
import { DocumentsController } from './controllers/documents.controller';
import { Document } from './entities/document.entity';
import { UsersModule } from '../users/users.module';
import { JobsModule } from '../jobs/jobs.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Document]),
    MulterModule.register({
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
    }),
    UsersModule,
    JobsModule,
  ],
  controllers: [DocumentsController],
  providers: [DocumentsService, DocumentUploadService, DocumentGeneratorService],
  exports: [DocumentsService, DocumentUploadService, DocumentGeneratorService],
})
export class DocumentsModule {}
