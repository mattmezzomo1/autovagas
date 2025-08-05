import { IsOptional, IsString, IsNumber, Min, Max, IsArray, IsUrl, IsEmail, MinLength, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';

export class UpdateProfileDto {
  @ApiPropertyOptional({ description: 'Nome completo do usuário' })
  @IsOptional()
  @IsString()
  @MinLength(3, { message: 'O nome deve ter pelo menos 3 caracteres' })
  @MaxLength(100, { message: 'O nome deve ter no máximo 100 caracteres' })
  fullName?: string;

  @ApiPropertyOptional({ description: 'Telefone do usuário' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ description: 'Localização do usuário' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ description: 'Título profissional do usuário' })
  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'O título deve ter no máximo 100 caracteres' })
  title?: string;

  @ApiPropertyOptional({ description: 'Anos de experiência' })
  @IsOptional()
  @IsNumber()
  @Min(0, { message: 'A experiência não pode ser negativa' })
  @Max(50, { message: 'A experiência não pode exceder 50 anos' })
  @Type(() => Number)
  experience?: number;

  @ApiPropertyOptional({ description: 'Habilidades do usuário (separadas por vírgula)' })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  skills?: string;

  @ApiPropertyOptional({ description: 'Biografia do usuário' })
  @IsOptional()
  @IsString()
  @MaxLength(1000, { message: 'A biografia deve ter no máximo 1000 caracteres' })
  bio?: string;

  @ApiPropertyOptional({ description: 'URL do portfólio' })
  @IsOptional()
  @IsUrl({}, { message: 'URL do portfólio inválida' })
  portfolioUrl?: string;

  @ApiPropertyOptional({ description: 'URL do LinkedIn' })
  @IsOptional()
  @IsUrl({}, { message: 'URL do LinkedIn inválida' })
  linkedinUrl?: string;

  @ApiPropertyOptional({ description: 'URL do GitHub' })
  @IsOptional()
  @IsUrl({}, { message: 'URL do GitHub inválida' })
  githubUrl?: string;

  @ApiPropertyOptional({ description: 'Tipos de trabalho de interesse (separados por vírgula)' })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  jobTypes?: string;

  @ApiPropertyOptional({ description: 'Modelos de trabalho de interesse (separados por vírgula)' })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  workModels?: string;

  @ApiPropertyOptional({ description: 'Expectativa salarial mínima' })
  @IsOptional()
  @IsNumber()
  @Min(0, { message: 'A expectativa salarial não pode ser negativa' })
  @Type(() => Number)
  salaryExpectationMin?: number;

  @ApiPropertyOptional({ description: 'Expectativa salarial máxima' })
  @IsOptional()
  @IsNumber()
  @Min(0, { message: 'A expectativa salarial não pode ser negativa' })
  @Type(() => Number)
  salaryExpectationMax?: number;

  @ApiPropertyOptional({ description: 'Indústrias de interesse (separadas por vírgula)' })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  industries?: string;

  @ApiPropertyOptional({ description: 'Localizações de interesse (separadas por vírgula)' })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  locations?: string;
}
