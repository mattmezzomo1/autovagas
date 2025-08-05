import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsNumber, IsArray, IsOptional } from 'class-validator';
import { JobType, WorkModel } from '../entities/job.entity';
import { Transform } from 'class-transformer';

export class SearchJobsDto {
  @ApiProperty({ description: 'Search by job title', required: false })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({ description: 'Search by location', required: false })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiProperty({ description: 'Filter by job types', enum: JobType, isArray: true, required: false })
  @IsEnum(JobType, { each: true })
  @IsArray()
  @IsOptional()
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  jobTypes?: JobType[];

  @ApiProperty({ description: 'Filter by work models', enum: WorkModel, isArray: true, required: false })
  @IsEnum(WorkModel, { each: true })
  @IsArray()
  @IsOptional()
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  workModels?: WorkModel[];

  @ApiProperty({ description: 'Minimum salary', required: false })
  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => (value ? parseInt(value) : undefined))
  salaryMin?: number;

  @ApiProperty({ description: 'Filter by industry', required: false })
  @IsString()
  @IsOptional()
  industry?: string;

  @ApiProperty({ description: 'Filter by skills', isArray: true, required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  skills?: string[];
}
