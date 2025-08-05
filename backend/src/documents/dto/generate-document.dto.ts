import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional } from 'class-validator';
import { DocumentType } from '../entities/document.entity';

export class GenerateDocumentDto {
  @ApiProperty({ description: 'Document name', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ description: 'Document type', enum: DocumentType })
  @IsEnum(DocumentType)
  type: DocumentType;

  @ApiProperty({ description: 'Content or prompt for document generation' })
  @IsString()
  content: string;
}
