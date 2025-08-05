import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsArray, IsString, IsNumber, Min, Max } from 'class-validator';

export class CreateMatchCriteriaDto {
  @ApiProperty({ description: 'Whether matchmaking is enabled for this user', required: false, default: true })
  @IsBoolean()
  @IsOptional()
  enabled?: boolean = true;

  @ApiProperty({ description: 'Minimum experience years for matches', required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  minExperienceYears?: number;

  @ApiProperty({ description: 'Maximum experience years for matches', required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  maxExperienceYears?: number;

  @ApiProperty({ description: 'Skills to match with', type: [String], required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  desiredSkills?: string[];

  @ApiProperty({ description: 'Skills to exclude from matching', type: [String], required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  excludedSkills?: string[];

  @ApiProperty({ description: 'Industries to match with', type: [String], required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  industries?: string[];

  @ApiProperty({ description: 'Locations to match with', type: [String], required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  locations?: string[];

  @ApiProperty({ description: 'Whether to match with remote users only', required: false, default: false })
  @IsBoolean()
  @IsOptional()
  remoteOnly?: boolean = false;

  @ApiProperty({ description: 'Maximum number of matches to receive per week', required: false, default: 5 })
  @IsNumber()
  @Min(1)
  @Max(20)
  @IsOptional()
  maxMatchesPerWeek?: number = 5;

  @ApiProperty({ description: 'Whether to receive match notifications', required: false, default: true })
  @IsBoolean()
  @IsOptional()
  notificationsEnabled?: boolean = true;
}
