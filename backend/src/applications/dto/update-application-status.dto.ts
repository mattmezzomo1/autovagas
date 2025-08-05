import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString, IsOptional } from 'class-validator';
import { ApplicationStatus } from '../entities/application.entity';

export class UpdateApplicationStatusDto {
  @ApiProperty({ description: 'New application status', enum: ApplicationStatus })
  @IsEnum(ApplicationStatus)
  status: ApplicationStatus;

  @ApiProperty({ description: 'Notes from the company', required: false })
  @IsString()
  @IsOptional()
  companyNotes?: string;
}
