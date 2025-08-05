import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEnum,
  IsNumber,
  IsArray,
  IsOptional,
  IsUrl,
  Min,
  Max,
  ArrayMinSize,
} from 'class-validator';
import { CompanySize } from '../entities/company.entity';

export class CreateCompanyDto {
  @ApiProperty({ description: 'Company name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Company description' })
  @IsString()
  description: string;

  @ApiProperty({ description: 'Company website URL', required: false })
  @IsUrl()
  @IsOptional()
  website?: string;

  @ApiProperty({ description: 'Company industry' })
  @IsString()
  industry: string;

  @ApiProperty({ description: 'Company size', enum: CompanySize })
  @IsEnum(CompanySize)
  size: CompanySize;

  @ApiProperty({ description: 'Company location' })
  @IsString()
  location: string;

  @ApiProperty({ description: 'Company founding year', required: false })
  @IsNumber()
  @Min(1800)
  @Max(new Date().getFullYear())
  @IsOptional()
  foundingYear?: number;

  @ApiProperty({ description: 'Company LinkedIn URL', required: false })
  @IsUrl()
  @IsOptional()
  linkedinUrl?: string;

  @ApiProperty({ description: 'Company benefits offered', type: [String], required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  benefits?: string[];

  @ApiProperty({ description: 'Company culture keywords', type: [String], required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  culture?: string[];
}
