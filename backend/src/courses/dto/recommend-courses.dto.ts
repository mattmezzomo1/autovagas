import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsArray, IsString, IsEnum } from 'class-validator';
import { CourseLevel } from '../entities/course.entity';

export class RecommendCoursesDto {
  @ApiProperty({ description: 'User skills to match with courses', type: [String] })
  @IsArray()
  @IsString({ each: true })
  skills: string[];

  @ApiProperty({ description: 'Job title to match with courses' })
  @IsString()
  jobTitle: string;

  @ApiProperty({ description: 'Preferred course level', enum: CourseLevel, required: false })
  @IsEnum(CourseLevel)
  @IsOptional()
  level?: CourseLevel;

  @ApiProperty({ description: 'Maximum number of recommendations to return', required: false, default: 5 })
  @IsOptional()
  limit?: number = 5;
}
