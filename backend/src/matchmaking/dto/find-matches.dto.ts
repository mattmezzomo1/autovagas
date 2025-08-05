import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsArray, IsString, IsNumber, Min, Max } from 'class-validator';
import { MatchStatus } from '../entities/match.entity';

export class FindMatchesDto {
  @ApiProperty({ description: 'Filter by match status', enum: MatchStatus, required: false })
  @IsEnum(MatchStatus)
  @IsOptional()
  status?: MatchStatus;

  @ApiProperty({ description: 'Filter by skills', type: [String], required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  skills?: string[];

  @ApiProperty({ description: 'Filter by industries', type: [String], required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  industries?: string[];

  @ApiProperty({ description: 'Filter by locations', type: [String], required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  locations?: string[];

  @ApiProperty({ description: 'Minimum match score (0-100)', required: false, minimum: 0, maximum: 100 })
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  minScore?: number;

  @ApiProperty({ description: 'Maximum number of results to return', required: false, default: 10 })
  @IsNumber()
  @Min(1)
  @Max(50)
  @IsOptional()
  limit?: number = 10;
}
