import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class AnalyzeResumeDto {
  @ApiProperty({ description: 'Resume text content to analyze' })
  @IsString()
  @IsNotEmpty()
  resumeText: string;
}
