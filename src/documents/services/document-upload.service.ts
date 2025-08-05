import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient } from '@supabase/supabase-js';
import * as path from 'path';
import * as crypto from 'crypto';
import { DocumentType, DocumentFormat, DocumentSource } from '../entities/document.entity';
import { DocumentsService } from './documents.service';

@Injectable()
export class DocumentUploadService {
  private supabase;
  private readonly bucketName = 'documents';

  constructor(
    private configService: ConfigService,
    private documentsService: DocumentsService,
  ) {
    this.supabase = createClient(
      this.configService.get<string>('supabase.url'),
      this.configService.get<string>('supabase.key'),
    );
    
    // Ensure bucket exists
    this.initBucket();
  }

  private async initBucket() {
    const { data, error } = await this.supabase.storage.getBucket(this.bucketName);
    
    if (error && error.statusCode === 404) {
      // Create bucket if it doesn't exist
      await this.supabase.storage.createBucket(this.bucketName, {
        public: true,
        fileSizeLimit: 1024 * 1024 * 10, // 10MB
        allowedMimeTypes: [
          'application/pdf',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'text/plain',
          'text/html',
          'text/markdown',
        ],
      });
    }
  }

  async uploadDocument(
    userId: string,
    file: Express.Multer.File,
    documentType: DocumentType,
    name?: string,
    isDefault?: boolean,
  ): Promise<any> {
    if (!file) {
      throw new BadRequestException('Arquivo não fornecido');
    }

    // Validate file type
    const allowedMimeTypes = {
      'application/pdf': DocumentFormat.PDF,
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': DocumentFormat.DOCX,
      'text/plain': DocumentFormat.TXT,
      'text/html': DocumentFormat.HTML,
      'text/markdown': DocumentFormat.MARKDOWN,
    };

    if (!Object.keys(allowedMimeTypes).includes(file.mimetype)) {
      throw new BadRequestException('Tipo de arquivo não suportado. Use PDF, DOCX, TXT, HTML ou Markdown.');
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new BadRequestException('Tamanho do arquivo excede o limite de 10MB');
    }

    // Generate unique filename
    const fileExtension = path.extname(file.originalname);
    const randomName = crypto.randomBytes(16).toString('hex');
    const fileName = `${userId}/${documentType.toLowerCase()}/${randomName}${fileExtension}`;

    // Upload to Supabase Storage
    const { data, error } = await this.supabase.storage
      .from(this.bucketName)
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: true,
      });

    if (error) {
      throw new BadRequestException(`Erro ao fazer upload do arquivo: ${error.message}`);
    }

    // Get public URL
    const { data: urlData } = this.supabase.storage
      .from(this.bucketName)
      .getPublicUrl(fileName);

    // Determine document format
    const format = allowedMimeTypes[file.mimetype];

    // Create document record
    const documentName = name || file.originalname;
    const document = await this.documentsService.create(userId, {
      name: documentName,
      type: documentType,
      format,
      source: DocumentSource.UPLOAD,
      url: urlData.publicUrl,
      fileSize: file.size,
      contentType: file.mimetype,
      isDefault: isDefault || false,
    });

    return document;
  }

  async deleteDocument(documentId: string, userId: string): Promise<void> {
    // Get document
    const document = await this.documentsService.findOne(documentId, userId);

    // Extract file path from URL
    const urlObj = new URL(document.url);
    const pathSegments = urlObj.pathname.split('/');
    const fileName = pathSegments.slice(pathSegments.indexOf(this.bucketName) + 1).join('/');

    // Delete from Supabase Storage
    const { error } = await this.supabase.storage
      .from(this.bucketName)
      .remove([fileName]);

    if (error) {
      throw new BadRequestException(`Erro ao excluir o arquivo: ${error.message}`);
    }

    // Delete document record
    await this.documentsService.remove(documentId, userId);
  }
}
