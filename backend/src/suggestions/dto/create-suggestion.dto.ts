import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEnum,
  IsNumber,
  IsArray,
  IsBoolean,
  IsOptional,
  IsUUID,
  Min,
  Max,
} from 'class-validator';
import { SuggestionType } from '../entities/suggestion.entity';

export class CreateSuggestionDto {
  @ApiProperty({ description: 'Suggestion title' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Suggestion description' })
  @IsString()
  description: string;

  @ApiProperty({ description: 'Suggestion type', enum: SuggestionType })
  @IsEnum(SuggestionType)
  type: SuggestionType;

  @ApiProperty({ description: 'Provider name', required: false })
  @IsString()
  @IsOptional()
  provider?: string;

  @ApiProperty({ description: 'Original price', required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  originalPrice?: number;

  @ApiProperty({ description: 'Discounted price', required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  discountPrice?: number;

  @ApiProperty({ description: 'Discount percentage', required: false })
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  discountPercentage?: number;

  @ApiProperty({ description: 'Relevance score (1-5)' })
  @IsNumber()
  @Min(1)
  @Max(5)
  relevance: number;

  @ApiProperty({ description: 'Duration of the course/training', required: false })
  @IsString()
  @IsOptional()
  duration?: string;

  @ApiProperty({ description: 'Link to the suggestion', required: false })
  @IsString()
  @IsOptional()
  link?: string;

  @ApiProperty({ description: 'Image URL', required: false })
  @IsString()
  @IsOptional()
  image?: string;

  @ApiProperty({ description: 'Tags related to the suggestion', type: [String], required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @ApiProperty({ description: 'Whether this is a featured suggestion', default: false, required: false })
  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean = false;

  @ApiProperty({ description: 'Whether this is a personalized suggestion', default: false, required: false })
  @IsBoolean()
  @IsOptional()
  isPersonalized?: boolean = false;

  @ApiProperty({ description: 'User ID for personalized suggestions', required: false })
  @IsUUID()
  @IsOptional()
  userId?: string;
}
