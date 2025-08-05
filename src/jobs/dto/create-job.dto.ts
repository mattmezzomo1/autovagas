import { IsNotEmpty, IsString, IsEnum, IsNumber, IsBoolean, IsOptional, IsDate, Min, Max, MinLength, MaxLength, IsPositive, IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { JobType, WorkModel } from '../entities/job.entity';

export class CreateJobDto {
  @ApiProperty({ description: 'Título da vaga' })
  @IsNotEmpty({ message: 'O título é obrigatório' })
  @IsString()
  @MinLength(5, { message: 'O título deve ter pelo menos 5 caracteres' })
  @MaxLength(100, { message: 'O título deve ter no máximo 100 caracteres' })
  title: string;

  @ApiProperty({ description: 'Descrição detalhada da vaga' })
  @IsNotEmpty({ message: 'A descrição é obrigatória' })
  @IsString()
  @MinLength(50, { message: 'A descrição deve ter pelo menos 50 caracteres' })
  description: string;

  @ApiProperty({ description: 'Nome da empresa' })
  @IsNotEmpty({ message: 'O nome da empresa é obrigatório' })
  @IsString()
  companyName: string;

  @ApiProperty({ description: 'Localização da vaga' })
  @IsNotEmpty({ message: 'A localização é obrigatória' })
  @IsString()
  location: string;

  @ApiProperty({ description: 'Tipo de contratação', enum: JobType })
  @IsNotEmpty({ message: 'O tipo de contratação é obrigatório' })
  @IsEnum(JobType, { message: 'Tipo de contratação inválido' })
  jobType: JobType;

  @ApiProperty({ description: 'Modelo de trabalho', enum: WorkModel })
  @IsNotEmpty({ message: 'O modelo de trabalho é obrigatório' })
  @IsEnum(WorkModel, { message: 'Modelo de trabalho inválido' })
  workModel: WorkModel;

  @ApiPropertyOptional({ description: 'Salário mínimo' })
  @IsOptional()
  @IsNumber()
  @Min(0, { message: 'O salário mínimo não pode ser negativo' })
  @Type(() => Number)
  salaryMin?: number;

  @ApiPropertyOptional({ description: 'Salário máximo' })
  @IsOptional()
  @IsNumber()
  @Min(0, { message: 'O salário máximo não pode ser negativo' })
  @Type(() => Number)
  salaryMax?: number;

  @ApiPropertyOptional({ description: 'Exibir informações de salário', default: true })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  displaySalary?: boolean = true;

  @ApiProperty({ description: 'Habilidades necessárias (separadas por vírgula)' })
  @IsNotEmpty({ message: 'As habilidades são obrigatórias' })
  @IsString()
  skills: string;

  @ApiProperty({ description: 'Requisitos para a vaga' })
  @IsNotEmpty({ message: 'Os requisitos são obrigatórios' })
  @IsString()
  requirements: string;

  @ApiPropertyOptional({ description: 'Benefícios oferecidos' })
  @IsOptional()
  @IsString()
  benefits?: string;

  @ApiProperty({ description: 'Indústria/setor da vaga' })
  @IsNotEmpty({ message: 'A indústria/setor é obrigatória' })
  @IsString()
  industry: string;

  @ApiPropertyOptional({ description: 'Carga horária semanal' })
  @IsOptional()
  @IsNumber()
  @IsPositive({ message: 'A carga horária deve ser positiva' })
  @Type(() => Number)
  workHours?: number;

  @ApiPropertyOptional({ description: 'Anos de experiência necessários' })
  @IsOptional()
  @IsNumber()
  @Min(0, { message: 'Os anos de experiência não podem ser negativos' })
  @Type(() => Number)
  experienceYears?: number;

  @ApiProperty({ description: 'Data de expiração da vaga' })
  @IsNotEmpty({ message: 'A data de expiração é obrigatória' })
  @IsDate()
  @Type(() => Date)
  expiresAt: Date;

  @ApiPropertyOptional({ description: 'Vaga ativa', default: true })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isActive?: boolean = true;

  @ApiPropertyOptional({ description: 'Número de vagas disponíveis', default: 1 })
  @IsOptional()
  @IsInt()
  @IsPositive({ message: 'O número de vagas deve ser positivo' })
  @Type(() => Number)
  vacancies?: number = 1;
}
