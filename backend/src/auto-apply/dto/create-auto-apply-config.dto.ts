import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsBoolean,
  IsNumber,
  IsArray,
  IsOptional,
  Min,
  Max,
  ArrayMinSize,
} from 'class-validator';

export class CreateAutoApplyConfigDto {
  @ApiProperty({ description: 'Keywords to search for jobs', type: [String], required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  keywords?: string[];

  @ApiProperty({ description: 'Locations to search for jobs', type: [String] })
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  locations: string[];

  @ApiProperty({ description: 'Whether to include remote jobs', default: true, required: false })
  @IsBoolean()
  @IsOptional()
  remote?: boolean = true;

  @ApiProperty({ description: 'Job types to search for', type: [String] })
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  jobTypes: string[];

  @ApiProperty({ description: 'Work models to search for', type: [String] })
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  workModels: string[];

  @ApiProperty({ description: 'Minimum salary to consider', required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  salaryMin?: number;

  @ApiProperty({ description: 'Maximum work hours per week', default: 40, required: false })
  @IsNumber()
  @Min(1)
  @Max(168) // Max hours in a week
  @IsOptional()
  workHours?: number = 40;

  @ApiProperty({ description: 'Whether to include international jobs', default: false, required: false })
  @IsBoolean()
  @IsOptional()
  internationalJobs?: boolean = false;

  @ApiProperty({ description: 'Experience level to search for', required: false })
  @IsString()
  @IsOptional()
  experienceLevel?: string;

  @ApiProperty({ description: 'Industries to search for', type: [String], required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  industries?: string[];

  @ApiProperty({ description: 'Minimum match score to apply automatically', default: 70, required: false })
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  matchThreshold?: number = 70;

  @ApiProperty({ description: 'Maximum applications per day', default: 10, required: false })
  @IsNumber()
  @Min(1)
  @Max(100)
  @IsOptional()
  maxApplicationsPerDay?: number = 10;

  @ApiProperty({ description: 'Run interval in milliseconds', default: 3600000, required: false })
  @IsNumber()
  @Min(60000) // Minimum 1 minute
  @IsOptional()
  runInterval?: number = 3600000; // 1 hour

  @ApiProperty({ description: 'Whether to run in headless mode', default: true, required: false })
  @IsBoolean()
  @IsOptional()
  headless?: boolean = true;

  @ApiProperty({ description: 'LinkedIn username', required: false })
  @IsString()
  @IsOptional()
  linkedinUsername?: string;

  @ApiProperty({ description: 'LinkedIn password', required: false })
  @IsString()
  @IsOptional()
  linkedinPassword?: string;

  @ApiProperty({ description: 'InfoJobs username', required: false })
  @IsString()
  @IsOptional()
  infojobsUsername?: string;

  @ApiProperty({ description: 'InfoJobs password', required: false })
  @IsString()
  @IsOptional()
  infojobsPassword?: string;

  @ApiProperty({ description: 'Catho username', required: false })
  @IsString()
  @IsOptional()
  cathoUsername?: string;

  @ApiProperty({ description: 'Catho password', required: false })
  @IsString()
  @IsOptional()
  cathoPassword?: string;
}
