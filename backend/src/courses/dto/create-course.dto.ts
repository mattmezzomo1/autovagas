import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsNumber, IsEnum, IsArray, Min, Max, IsUrl } from 'class-validator';
import { CourseLevel } from '../entities/course.entity';

export class CreateCourseDto {
  @ApiProperty({ description: 'Course title' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'Course description' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ description: 'Course provider' })
  @IsString()
  @IsNotEmpty()
  provider: string;

  @ApiProperty({ description: 'Course URL' })
  @IsUrl()
  @IsNotEmpty()
  url: string;

  @ApiProperty({ description: 'Course image URL', required: false })
  @IsUrl()
  @IsOptional()
  imageUrl?: string;

  @ApiProperty({ description: 'Course price', required: false })
  @IsNumber()
  @IsOptional()
  price?: number;

  @ApiProperty({ description: 'Course discount price', required: false })
  @IsNumber()
  @IsOptional()
  discountPrice?: number;

  @ApiProperty({ description: 'Course duration', required: false })
  @IsString()
  @IsOptional()
  duration?: string;

  @ApiProperty({ description: 'Course level', enum: CourseLevel, default: CourseLevel.BEGINNER })
  @IsEnum(CourseLevel)
  @IsOptional()
  level?: CourseLevel = CourseLevel.BEGINNER;

  @ApiProperty({ description: 'Course tags/skills', type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty()
  tags: string[];

  @ApiProperty({ description: 'Course category' })
  @IsString()
  @IsNotEmpty()
  category: string;

  @ApiProperty({ description: 'Course rating', required: false, minimum: 0, maximum: 5 })
  @IsNumber()
  @Min(0)
  @Max(5)
  @IsOptional()
  rating?: number;

  @ApiProperty({ description: 'Whether the course is featured', required: false, default: false })
  @IsOptional()
  featured?: boolean = false;
}
