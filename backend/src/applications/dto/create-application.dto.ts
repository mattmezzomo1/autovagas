import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, IsObject, IsOptional } from 'class-validator';

export class CreateApplicationDto {
  @ApiProperty({ description: 'Job ID to apply for' })
  @IsUUID()
  jobId: string;

  @ApiProperty({ description: 'Cover letter text', required: false })
  @IsString()
  @IsOptional()
  coverLetter?: string;

  @ApiProperty({ description: 'Path to resume document', required: false })
  @IsString()
  @IsOptional()
  resumePath?: string;

  @ApiProperty({ description: 'Answers to application questions', required: false })
  @IsObject()
  @IsOptional()
  answers?: Record<string, string>;

  @ApiProperty({ description: 'Notes from the candidate', required: false })
  @IsString()
  @IsOptional()
  candidateNotes?: string;
}
