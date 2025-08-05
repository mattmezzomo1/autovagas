import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsObject, IsArray, IsNumber, IsEnum } from 'class-validator';

export enum ImprovementType {
  GENERAL = 'general',
  ATS_OPTIMIZED = 'ats-optimized',
  CREATIVE = 'creative',
  TECHNICAL = 'technical',
}

export class UserProfileDto {
  @ApiProperty({ description: 'Full name', example: 'John Doe' })
  @IsString()
  fullName: string;

  @ApiProperty({ description: 'Professional title', example: 'Software Developer' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Email address', example: 'john@example.com' })
  @IsString()
  email: string;

  @ApiProperty({ description: 'Phone number', example: '+1234567890' })
  @IsString()
  phone: string;

  @ApiProperty({ description: 'Location', example: 'São Paulo, SP' })
  @IsString()
  location: string;

  @ApiProperty({ description: 'Professional bio', example: 'Experienced software developer...' })
  @IsString()
  bio: string;

  @ApiProperty({ description: 'Years of experience', example: 5 })
  @IsNumber()
  experience: number;

  @ApiProperty({ 
    description: 'List of skills', 
    example: ['JavaScript', 'React', 'Node.js'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  skills: string[];

  @ApiProperty({
    description: 'Salary expectation range',
    example: { min: 5000, max: 8000 },
    required: false,
  })
  @IsOptional()
  @IsObject()
  salaryExpectation?: {
    min: number;
    max: number;
  };
}

export class ImproveResumeDto {
  @ApiProperty({
    description: 'Current resume content',
    example: '# John Doe\n**Software Developer**\n\n## Experience\n...',
  })
  @IsString()
  currentContent: string;

  @ApiProperty({
    description: 'User profile information',
    type: UserProfileDto,
  })
  @IsObject()
  userProfile: UserProfileDto;

  @ApiProperty({
    description: 'Type of improvement to apply',
    enum: ImprovementType,
    example: ImprovementType.GENERAL,
    default: ImprovementType.GENERAL,
  })
  @IsOptional()
  @IsEnum(ImprovementType)
  improvementType?: ImprovementType = ImprovementType.GENERAL;
}
