import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsArray, IsObject } from 'class-validator';
import { Type } from 'class-transformer';

class SalaryExpectationDto {
  @ApiProperty({ description: 'Minimum salary expectation' })
  @IsNumber()
  min: number;

  @ApiProperty({ description: 'Maximum salary expectation' })
  @IsNumber()
  max: number;
}

export class UpdateUserDto {
  @ApiProperty({ description: 'User full name', required: false })
  @IsString()
  @IsOptional()
  fullName?: string;

  @ApiProperty({ description: 'User phone number', required: false })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ description: 'User location', required: false })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiProperty({ description: 'User professional title', required: false })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({ description: 'Years of professional experience', required: false })
  @IsNumber()
  @IsOptional()
  experience?: number;

  @ApiProperty({ description: 'User skills', required: false, type: [String] })
  @IsArray()
  @IsOptional()
  skills?: string[];

  @ApiProperty({ description: 'User bio or professional summary', required: false })
  @IsString()
  @IsOptional()
  bio?: string;

  @ApiProperty({ description: 'URL to user portfolio', required: false })
  @IsString()
  @IsOptional()
  portfolioUrl?: string;

  @ApiProperty({ description: 'URL to user LinkedIn profile', required: false })
  @IsString()
  @IsOptional()
  linkedinUrl?: string;

  @ApiProperty({ description: 'URL to user GitHub profile', required: false })
  @IsString()
  @IsOptional()
  githubUrl?: string;

  @ApiProperty({ description: 'Types of jobs the user is interested in', required: false, type: [String] })
  @IsArray()
  @IsOptional()
  jobTypes?: string[];

  @ApiProperty({ description: 'Work models the user is interested in', required: false, type: [String] })
  @IsArray()
  @IsOptional()
  workModels?: string[];

  @ApiProperty({ description: 'Salary expectation', required: false })
  @IsObject()
  @IsOptional()
  @Type(() => SalaryExpectationDto)
  salaryExpectation?: SalaryExpectationDto;

  @ApiProperty({ description: 'Industries the user is interested in', required: false, type: [String] })
  @IsArray()
  @IsOptional()
  industries?: string[];

  @ApiProperty({ description: 'Locations the user is interested in', required: false, type: [String] })
  @IsArray()
  @IsOptional()
  locations?: string[];

  @ApiProperty({ description: 'Refresh token for JWT authentication', required: false })
  @IsString()
  @IsOptional()
  refreshToken?: string;
}
