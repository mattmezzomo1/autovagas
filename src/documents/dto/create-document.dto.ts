import { IsNotEmpty, IsEnum, IsOptional, IsBoolean, IsObject, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DocumentType, DocumentFormat, DocumentSource } from '../entities/document.entity';

export class CreateDocumentDto {
  @ApiProperty({ description: 'Nome do documento' })
  @IsNotEmpty({ message: 'O nome do documento é obrigatório' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Tipo do documento', enum: DocumentType })
  @IsNotEmpty({ message: 'O tipo do documento é obrigatório' })
  @IsEnum(DocumentType, { message: 'Tipo de documento inválido' })
  type: DocumentType;

  @ApiProperty({ description: 'Formato do documento', enum: DocumentFormat })
  @IsNotEmpty({ message: 'O formato do documento é obrigatório' })
  @IsEnum(DocumentFormat, { message: 'Formato de documento inválido' })
  format: DocumentFormat;

  @ApiProperty({ description: 'Origem do documento', enum: DocumentSource })
  @IsNotEmpty({ message: 'A origem do documento é obrigatória' })
  @IsEnum(DocumentSource, { message: 'Origem de documento inválida' })
  source: DocumentSource;

  @ApiProperty({ description: 'URL do documento' })
  @IsNotEmpty({ message: 'A URL do documento é obrigatória' })
  @IsString()
  url: string;

  @ApiPropertyOptional({ description: 'Tamanho do arquivo em bytes' })
  @IsOptional()
  fileSize?: number;

  @ApiPropertyOptional({ description: 'Tipo de conteúdo (MIME type)' })
  @IsOptional()
  @IsString()
  contentType?: string;

  @ApiPropertyOptional({ description: 'Definir como documento padrão', default: false })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @ApiPropertyOptional({ description: 'Conteúdo do documento (para documentos gerados)' })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional({ description: 'Metadados do documento' })
  @IsOptional()
  @IsObject()
  metadata?: any;
}
