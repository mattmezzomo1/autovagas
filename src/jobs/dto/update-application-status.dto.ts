import { IsNotEmpty, IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ApplicationStatus } from '../entities/application.entity';

export class UpdateApplicationStatusDto {
  @ApiProperty({ description: 'Status da candidatura', enum: ApplicationStatus })
  @IsNotEmpty({ message: 'O status é obrigatório' })
  @IsEnum(ApplicationStatus, { message: 'Status inválido' })
  status: ApplicationStatus;

  @ApiPropertyOptional({ description: 'Notas sobre a candidatura' })
  @IsOptional()
  @IsString()
  notes?: string;
}
