import { IsOptional, IsEnum, IsBoolean, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { DocumentType, DocumentFormat, DocumentSource } from '../entities/document.entity';

export class GetDocumentsDto {
  @ApiPropertyOptional({ description: 'Tipo do documento', enum: DocumentType })
  @IsOptional()
  @IsEnum(DocumentType)
  type?: DocumentType;

  @ApiPropertyOptional({ description: 'Formato do documento', enum: DocumentFormat })
  @IsOptional()
  @IsEnum(DocumentFormat)
  format?: DocumentFormat;

  @ApiPropertyOptional({ description: 'Origem do documento', enum: DocumentSource })
  @IsOptional()
  @IsEnum(DocumentSource)
  source?: DocumentSource;

  @ApiPropertyOptional({ description: 'Apenas documentos ativos', default: true })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isActive?: boolean = true;

  @ApiPropertyOptional({ description: 'Apenas documentos padrão' })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isDefault?: boolean;

  @ApiPropertyOptional({ description: 'Número da página', default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Itens por página', default: 10 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number = 10;
}
