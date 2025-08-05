import { IsOptional, IsString, IsEnum, IsNumber, IsBoolean, IsArray, Min, Max, IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { JobType, WorkModel } from '../entities/job.entity';

export class SearchJobsDto {
  @ApiPropertyOptional({ description: 'Termo de busca (título, descrição, empresa)' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Localização da vaga' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ description: 'Tipos de contratação', isArray: true, enum: JobType })
  @IsOptional()
  @IsArray()
  @IsEnum(JobType, { each: true })
  jobTypes?: JobType[];

  @ApiPropertyOptional({ description: 'Modelos de trabalho', isArray: true, enum: WorkModel })
  @IsOptional()
  @IsArray()
  @IsEnum(WorkModel, { each: true })
  workModels?: WorkModel[];

  @ApiPropertyOptional({ description: 'Salário mínimo' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  salaryMin?: number;

  @ApiPropertyOptional({ description: 'Salário máximo' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  salaryMax?: number;

  @ApiPropertyOptional({ description: 'Habilidades necessárias (separadas por vírgula)' })
  @IsOptional()
  @IsString()
  skills?: string;

  @ApiPropertyOptional({ description: 'Indústria/setor da vaga' })
  @IsOptional()
  @IsString()
  industry?: string;

  @ApiPropertyOptional({ description: 'Experiência mínima em anos' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  experienceMin?: number;

  @ApiPropertyOptional({ description: 'Experiência máxima em anos' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  experienceMax?: number;

  @ApiPropertyOptional({ description: 'Apenas vagas ativas', default: true })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isActive?: boolean = true;

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

  @ApiPropertyOptional({ 
    description: 'Campo para ordenação', 
    default: 'createdAt',
    enum: ['createdAt', 'title', 'salaryMin', 'salaryMax', 'experienceYears', 'expiresAt']
  })
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({ 
    description: 'Direção da ordenação', 
    default: 'DESC',
    enum: ['ASC', 'DESC']
  })
  @IsOptional()
  @IsString()
  sortDirection?: 'ASC' | 'DESC' = 'DESC';
}
