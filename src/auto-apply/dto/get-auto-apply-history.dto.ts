import { IsOptional, IsEnum, IsDateString, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { AutoApplyStatus, AutoApplyReason } from '../entities/auto-apply-history.entity';

export class GetAutoApplyHistoryDto {
  @ApiPropertyOptional({ 
    description: 'Status do auto-apply',
    enum: AutoApplyStatus
  })
  @IsOptional()
  @IsEnum(AutoApplyStatus)
  status?: AutoApplyStatus;

  @ApiPropertyOptional({ 
    description: 'Motivo do auto-apply',
    enum: AutoApplyReason
  })
  @IsOptional()
  @IsEnum(AutoApplyReason)
  reason?: AutoApplyReason;

  @ApiPropertyOptional({ 
    description: 'Data de início (formato ISO)',
    example: '2023-01-01'
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ 
    description: 'Data de fim (formato ISO)',
    example: '2023-12-31'
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ 
    description: 'Número da página',
    default: 1
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({ 
    description: 'Itens por página',
    default: 10
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number = 10;
}
