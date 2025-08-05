import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum, IsArray } from 'class-validator';
import { CourseLevel } from '../entities/course.entity';

export class CourseFilterDto {
  @ApiProperty({ description: 'Search term for course title or description', required: false })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiProperty({ description: 'Filter by course provider', required: false })
  @IsString()
  @IsOptional()
  provider?: string;

  @ApiProperty({ description: 'Filter by course level', enum: CourseLevel, required: false })
  @IsEnum(CourseLevel)
  @IsOptional()
  level?: CourseLevel;

  @ApiProperty({ description: 'Filter by course category', required: false })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiProperty({ description: 'Filter by course tags', type: [String], required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @ApiProperty({ description: 'Filter featured courses only', required: false })
  @IsOptional()
  featured?: boolean;
}
