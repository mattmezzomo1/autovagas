import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsEnum, IsNumber, IsArray, Min, Max } from 'class-validator';
import { CareerGoalTimeframe } from '../entities/career-goal.entity';

export class CreateCareerGoalDto {
  @ApiProperty({ description: 'Career goal title' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'Detailed description of the career goal' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ description: 'Target position or role' })
  @IsString()
  @IsNotEmpty()
  targetPosition: string;

  @ApiProperty({ description: 'Target company type or specific company', required: false })
  @IsString()
  @IsOptional()
  targetCompany?: string;

  @ApiProperty({ description: 'Target industry' })
  @IsString()
  @IsNotEmpty()
  targetIndustry: string;

  @ApiProperty({ description: 'Target salary range minimum', required: false })
  @IsNumber()
  @IsOptional()
  @Min(0)
  targetSalaryMin?: number;

  @ApiProperty({ description: 'Target salary range maximum', required: false })
  @IsNumber()
  @IsOptional()
  @Min(0)
  targetSalaryMax?: number;

  @ApiProperty({ 
    description: 'Expected timeframe to achieve the goal',
    enum: CareerGoalTimeframe,
    default: CareerGoalTimeframe.MEDIUM_TERM
  })
  @IsEnum(CareerGoalTimeframe)
  @IsOptional()
  timeframe?: CareerGoalTimeframe = CareerGoalTimeframe.MEDIUM_TERM;

  @ApiProperty({ description: 'Priority level (1-5, where 5 is highest)', minimum: 1, maximum: 5 })
  @IsNumber()
  @Min(1)
  @Max(5)
  @IsOptional()
  priority?: number = 3;

  @ApiProperty({ description: 'Skills required to achieve this goal', type: [String], required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  requiredSkills?: string[];

  @ApiProperty({ description: 'Additional notes or context', required: false })
  @IsString()
  @IsOptional()
  notes?: string;
}
