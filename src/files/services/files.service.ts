import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient } from '@supabase/supabase-js';
import * as path from 'path';
import * as fs from 'fs';
import * as crypto from 'crypto';

@Injectable()
export class FilesService {
  private supabase;
  private readonly bucketName = 'profile-images';

  constructor(private configService: ConfigService) {
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
        fileSizeLimit: 1024 * 1024 * 2, // 2MB
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp']
      });
    }
  }

  async uploadProfileImage(userId: string, file: Express.Multer.File): Promise<string> {
    if (!file) {
      throw new BadRequestException('Arquivo não fornecido');
    }

    // Validate file type
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('Tipo de arquivo não suportado. Use JPEG, PNG ou WebP.');
    }

    // Validate file size (max 2MB)
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      throw new BadRequestException('Tamanho do arquivo excede o limite de 2MB');
    }

    // Generate unique filename
    const fileExtension = path.extname(file.originalname);
    const randomName = crypto.randomBytes(16).toString('hex');
    const fileName = `${userId}/${randomName}${fileExtension}`;

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

    return urlData.publicUrl;
  }

  async deleteProfileImage(imageUrl: string): Promise<void> {
    // Extract file path from URL
    const urlObj = new URL(imageUrl);
    const pathSegments = urlObj.pathname.split('/');
    const fileName = pathSegments.slice(pathSegments.indexOf(this.bucketName) + 1).join('/');

    // Delete from Supabase Storage
    const { error } = await this.supabase.storage
      .from(this.bucketName)
      .remove([fileName]);

    if (error) {
      throw new BadRequestException(`Erro ao excluir o arquivo: ${error.message}`);
    }
  }
}
