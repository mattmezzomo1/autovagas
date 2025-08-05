import { IsOptional, IsBoolean, IsString, IsNumber, IsEnum, IsArray, Min, Max, IsUrl } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { JobType, WorkModel } from '../../jobs/entities/job.entity';

export class UpdateAutoApplyConfigDto {
  @ApiPropertyOptional({ 
    description: 'Habilitar auto-apply',
    type: Boolean,
    example: true
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isEnabled?: boolean;

  @ApiPropertyOptional({ 
    description: 'Palavras-chave para busca de vagas (separadas por vírgula)',
    example: 'desenvolvedor, programador, javascript, react'
  })
  @IsOptional()
  @IsString()
  keywords?: string;

  @ApiPropertyOptional({ 
    description: 'Localizações de interesse (separadas por vírgula)',
    example: 'São Paulo, Rio de Janeiro, Remoto'
  })
  @IsOptional()
  @IsString()
  locations?: string;

  @ApiPropertyOptional({ 
    description: 'Indústrias de interesse (separadas por vírgula)',
    example: 'Tecnologia, Finanças, Educação'
  })
  @IsOptional()
  @IsString()
  industries?: string;

  @ApiPropertyOptional({ 
    description: 'Palavras-chave a serem excluídas (separadas por vírgula)',
    example: 'vendas, atendimento, suporte'
  })
  @IsOptional()
  @IsString()
  excludedKeywords?: string;

  @ApiPropertyOptional({ 
    description: 'Empresas a serem excluídas (separadas por vírgula)',
    example: 'Empresa A, Empresa B'
  })
  @IsOptional()
  @IsString()
  excludedCompanies?: string;

  @ApiPropertyOptional({ 
    description: 'Tipos de contratação',
    isArray: true,
    enum: JobType,
    example: [JobType.CLT, JobType.PJ]
  })
  @IsOptional()
  @IsArray()
  @IsEnum(JobType, { each: true })
  jobTypes?: JobType[];

  @ApiPropertyOptional({ 
    description: 'Modelos de trabalho',
    isArray: true,
    enum: WorkModel,
    example: [WorkModel.REMOTE, WorkModel.HYBRID]
  })
  @IsOptional()
  @IsArray()
  @IsEnum(WorkModel, { each: true })
  workModels?: WorkModel[];

  @ApiPropertyOptional({ 
    description: 'Salário mínimo',
    example: 5000
  })
  @IsOptional()
  @IsNumber()
  @Min(0, { message: 'O salário mínimo não pode ser negativo' })
  @Type(() => Number)
  salaryMin?: number;

  @ApiPropertyOptional({ 
    description: 'Experiência máxima em anos',
    example: 5
  })
  @IsOptional()
  @IsNumber()
  @Min(0, { message: 'A experiência máxima não pode ser negativa' })
  @Type(() => Number)
  experienceMax?: number;

  @ApiPropertyOptional({ 
    description: 'Limiar de correspondência (1-10)',
    example: 5
  })
  @IsOptional()
  @IsNumber()
  @Min(1, { message: 'O limiar de correspondência deve ser pelo menos 1' })
  @Max(10, { message: 'O limiar de correspondência deve ser no máximo 10' })
  @Type(() => Number)
  matchThreshold?: number;

  @ApiPropertyOptional({ 
    description: 'Carta de apresentação padrão',
    example: 'Olá, estou interessado na vaga...'
  })
  @IsOptional()
  @IsString()
  defaultCoverLetter?: string;

  @ApiPropertyOptional({ 
    description: 'URL do currículo padrão',
    example: 'https://example.com/resume.pdf'
  })
  @IsOptional()
  @IsString()
  @IsUrl({}, { message: 'URL do currículo inválida' })
  defaultResumeUrl?: string;
}
