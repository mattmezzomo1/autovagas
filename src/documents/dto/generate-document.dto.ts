import { IsNotEmpty, IsEnum, IsOptional, IsString, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DocumentType, DocumentFormat } from '../entities/document.entity';

export class ResumeGenerationOptions {
  @ApiProperty({ description: 'Estilo do currículo', example: 'professional' })
  @IsNotEmpty()
  @IsString()
  style: string;

  @ApiProperty({ description: 'Nível de detalhamento', example: 'detailed' })
  @IsNotEmpty()
  @IsString()
  detailLevel: string;

  @ApiPropertyOptional({ description: 'Habilidades a destacar', example: ['JavaScript', 'React', 'Node.js'] })
  @IsOptional()
  @IsString({ each: true })
  highlightSkills?: string[];

  @ApiPropertyOptional({ description: 'Experiências a destacar', example: ['Desenvolvedor Frontend', 'Líder Técnico'] })
  @IsOptional()
  @IsString({ each: true })
  highlightExperiences?: string[];

  @ApiPropertyOptional({ description: 'Idioma do documento', example: 'pt-BR' })
  @IsOptional()
  @IsString()
  language?: string;
}

export class CoverLetterGenerationOptions {
  @ApiProperty({ description: 'Tom da carta', example: 'professional' })
  @IsNotEmpty()
  @IsString()
  tone: string;

  @ApiProperty({ description: 'Nível de formalidade', example: 'formal' })
  @IsNotEmpty()
  @IsString()
  formalityLevel: string;

  @ApiPropertyOptional({ description: 'Pontos a destacar', example: ['Experiência em liderança', 'Conhecimento técnico'] })
  @IsOptional()
  @IsString({ each: true })
  highlightPoints?: string[];

  @ApiPropertyOptional({ description: 'ID da vaga para personalização', example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsOptional()
  @IsString()
  jobId?: string;

  @ApiPropertyOptional({ description: 'Idioma do documento', example: 'pt-BR' })
  @IsOptional()
  @IsString()
  language?: string;
}

export class GenerateDocumentDto {
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

  @ApiPropertyOptional({ description: 'Definir como documento padrão', default: false })
  @IsOptional()
  @IsString()
  isDefault?: boolean;

  @ApiPropertyOptional({ description: 'Opções de geração para currículo' })
  @IsOptional()
  @ValidateNested()
  @Type(() => ResumeGenerationOptions)
  resumeOptions?: ResumeGenerationOptions;

  @ApiPropertyOptional({ description: 'Opções de geração para carta de apresentação' })
  @IsOptional()
  @ValidateNested()
  @Type(() => CoverLetterGenerationOptions)
  coverLetterOptions?: CoverLetterGenerationOptions;

  @ApiPropertyOptional({ description: 'Conteúdo base para geração' })
  @IsOptional()
  @IsString()
  baseContent?: string;

  @ApiPropertyOptional({ description: 'Metadados adicionais' })
  @IsOptional()
  @IsObject()
  metadata?: any;
}
