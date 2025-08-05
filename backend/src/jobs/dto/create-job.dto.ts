import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEnum,
  IsNumber,
  IsArray,
  IsBoolean,
  IsOptional,
  IsDateString,
  Min,
  Max,
  ArrayMinSize,
} from 'class-validator';
import { JobType, WorkModel } from '../entities/job.entity';

export class CreateJobDto {
  @ApiProperty({ description: 'Job title' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Job description' })
  @IsString()
  description: string;

  @ApiProperty({ description: 'Company name' })
  @IsString()
  companyName: string;

  @ApiProperty({ description: 'Job location' })
  @IsString()
  location: string;

  @ApiProperty({ description: 'Job type', enum: JobType })
  @IsEnum(JobType)
  jobType: JobType;

  @ApiProperty({ description: 'Work model', enum: WorkModel })
  @IsEnum(WorkModel)
  workModel: WorkModel;

  @ApiProperty({ description: 'Minimum salary', required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  salaryMin?: number;

  @ApiProperty({ description: 'Maximum salary', required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  salaryMax?: number;

  @ApiProperty({ description: 'Whether to display salary information', default: true, required: false })
  @IsBoolean()
  @IsOptional()
  displaySalary?: boolean = true;

  @ApiProperty({ description: 'Required skills for the job', type: [String] })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  skills: string[];

  @ApiProperty({ description: 'Job requirements', type: [String] })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  requirements: string[];

  @ApiProperty({ description: 'Job benefits', type: [String], required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  benefits?: string[];

  @ApiProperty({ description: 'Industry the job belongs to' })
  @IsString()
  industry: string;

  @ApiProperty({ description: 'Work hours per week', required: false })
  @IsNumber()
  @Min(1)
  @Max(168) // Max hours in a week
  @IsOptional()
  workHours?: number;

  @ApiProperty({ description: 'Experience level required (in years)', required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  experienceYears?: number;

  @ApiProperty({ description: 'Date when the job posting expires', required: false })
  @IsDateString()
  @IsOptional()
  expiresAt?: string;

  @ApiProperty({ description: 'Number of vacancies available', default: 1, required: false })
  @IsNumber()
  @Min(1)
  @IsOptional()
  vacancies?: number = 1;
}
