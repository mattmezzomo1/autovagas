import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsArray } from 'class-validator';

export class CreateMatchDto {
  @ApiProperty({ description: 'ID of the user to match with' })
  @IsString()
  @IsNotEmpty()
  receiverId: string;

  @ApiProperty({ description: 'Notes about the match', required: false })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({ description: 'Reasons for the match', type: [String], required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  matchReasons?: string[];
}
