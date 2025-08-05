import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { MatchStatus } from '../entities/match.entity';

export class UpdateMatchStatusDto {
  @ApiProperty({ description: 'New status for the match', enum: MatchStatus })
  @IsEnum(MatchStatus)
  @IsNotEmpty()
  status: MatchStatus;

  @ApiProperty({ description: 'Notes about the decision', required: false })
  @IsString()
  @IsOptional()
  notes?: string;
}
