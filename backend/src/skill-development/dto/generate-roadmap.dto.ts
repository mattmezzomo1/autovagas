import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsNumber, IsArray, Min, Max } from 'class-validator';

export class GenerateRoadmapDto {
  @ApiProperty({ description: 'Career goal ID to generate roadmap for' })
  @IsString()
  @IsNotEmpty()
  careerGoalId: string;

  @ApiProperty({ description: 'Current experience level in years', required: false })
  @IsNumber()
  @IsOptional()
  @Min(0)
  currentExperience?: number;

  @ApiProperty({ description: 'Current skills', type: [String], required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  currentSkills?: string[];

  @ApiProperty({ description: 'Preferred learning style', required: false })
  @IsString()
  @IsOptional()
  learningStyle?: string;

  @ApiProperty({ description: 'Available time per week for learning (hours)', required: false })
  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(40)
  availableHoursPerWeek?: number;

  @ApiProperty({ description: 'Budget for learning resources', required: false })
  @IsNumber()
  @IsOptional()
  @Min(0)
  budget?: number;

  @ApiProperty({ description: 'Preferred learning formats', type: [String], required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  preferredFormats?: string[]; // ['online', 'in-person', 'self-paced', 'mentorship']

  @ApiProperty({ description: 'Industry focus areas', type: [String], required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  industryFocus?: string[];

  @ApiProperty({ description: 'Additional context or requirements', required: false })
  @IsString()
  @IsOptional()
  additionalContext?: string;
}
