import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum } from 'class-validator';
import { DocumentType } from '../entities/document.entity';

export class CreateDocumentDto {
  @ApiProperty({ description: 'Document name', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ description: 'Document type', enum: DocumentType, required: false })
  @IsEnum(DocumentType)
  @IsOptional()
  type?: DocumentType;
}
