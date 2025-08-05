import { IsNotEmpty, IsString, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateApplicationDto {
  @ApiProperty({ description: 'ID da vaga' })
  @IsNotEmpty({ message: 'O ID da vaga é obrigatório' })
  @IsUUID('4', { message: 'ID da vaga inválido' })
  jobId: string;

  @ApiPropertyOptional({ description: 'Carta de apresentação' })
  @IsOptional()
  @IsString()
  coverLetter?: string;

  @ApiPropertyOptional({ description: 'URL do currículo' })
  @IsOptional()
  @IsString()
  resumeUrl?: string;
}
