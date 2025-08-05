import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentsService } from './documents.service';
import { DocumentsController } from './documents.controller';
import { PdfService } from './pdf.service';
import { AiService } from './ai.service';
import { Document } from './entities/document.entity';
import { StorageModule } from '../storage/storage.module';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Document]),
    StorageModule,
    AiModule,
  ],
  controllers: [DocumentsController],
  providers: [DocumentsService, PdfService, AiService],
  exports: [DocumentsService, PdfService, AiService],
})
export class DocumentsModule {}
