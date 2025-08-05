import {
  IsOptional,
  IsString,
  IsEnum,
  IsArray,
  IsNumber,
  Min,
  Max,
  IsBoolean,
  ArrayMinSize,
  ArrayMaxSize,
  ValidateNested,
  IsDateString,
  IsInt,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { JobType, JobLevel, JobLocation } from '../../jobs/entities/job.entity';

export class SalaryFilterDto {
  @ApiPropertyOptional({
    description: 'Minimum salary',
    example: 3000,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Minimum salary must be a number' })
  @Min(0, { message: 'Minimum salary must be at least 0' })
  @Type(() => Number)
  min?: number;

  @ApiPropertyOptional({
    description: 'Maximum salary',
    example: 5000,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Maximum salary must be a number' })
  @Min(0, { message: 'Maximum salary must be at least 0' })
  @Type(() => Number)
  max?: number;
}

export class LocationFilterDto {
  @ApiPropertyOptional({
    description: 'City name',
    example: 'São Paulo',
  })
  @IsOptional()
  @IsString({ message: 'City must be a string' })
  city?: string;

  @ApiPropertyOptional({
    description: 'State name',
    example: 'SP',
  })
  @IsOptional()
  @IsString({ message: 'State must be a string' })
  state?: string;

  @ApiPropertyOptional({
    description: 'Country name',
    example: 'Brazil',
  })
  @IsOptional()
  @IsString({ message: 'Country must be a string' })
  country?: string;

  @ApiPropertyOptional({
    description: 'Radius in kilometers',
    example: 50,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Radius must be a number' })
  @Min(1, { message: 'Radius must be at least 1' })
  @Max(500, { message: 'Radius must be at most 500' })
  @Type(() => Number)
  radius?: number;
}

export class DateFilterDto {
  @ApiPropertyOptional({
    description: 'Start date',
    example: '2023-01-01',
  })
  @IsOptional()
  @IsDateString({}, { message: 'Start date must be a valid date' })
  start?: string;

  @ApiPropertyOptional({
    description: 'End date',
    example: '2023-12-31',
  })
  @IsOptional()
  @IsDateString({}, { message: 'End date must be a valid date' })
  end?: string;
}

export class SearchJobsDto {
  @ApiPropertyOptional({
    description: 'Search query',
    example: 'software engineer',
  })
  @IsOptional()
  @IsString({ message: 'Query must be a string' })
  query?: string;

  @ApiPropertyOptional({
    description: 'Job types',
    enum: JobType,
    isArray: true,
    example: [JobType.FULL_TIME, JobType.PART_TIME],
  })
  @IsOptional()
  @IsArray({ message: 'Job types must be an array' })
  @IsEnum(JobType, { each: true, message: 'Invalid job type' })
  types?: JobType[];

  @ApiPropertyOptional({
    description: 'Job levels',
    enum: JobLevel,
    isArray: true,
    example: [JobLevel.JUNIOR, JobLevel.MID_LEVEL],
  })
  @IsOptional()
  @IsArray({ message: 'Job levels must be an array' })
  @IsEnum(JobLevel, { each: true, message: 'Invalid job level' })
  levels?: JobLevel[];

  @ApiPropertyOptional({
    description: 'Job location types',
    enum: JobLocation,
    isArray: true,
    example: [JobLocation.REMOTE, JobLocation.HYBRID],
  })
  @IsOptional()
  @IsArray({ message: 'Job location types must be an array' })
  @IsEnum(JobLocation, { each: true, message: 'Invalid job location type' })
  locationTypes?: JobLocation[];

  @ApiPropertyOptional({
    description: 'Location filter',
    type: LocationFilterDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => LocationFilterDto)
  location?: LocationFilterDto;

  @ApiPropertyOptional({
    description: 'Salary filter',
    type: SalaryFilterDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => SalaryFilterDto)
  salary?: SalaryFilterDto;

  @ApiPropertyOptional({
    description: 'Skills',
    isArray: true,
    example: ['JavaScript', 'React', 'Node.js'],
  })
  @IsOptional()
  @IsArray({ message: 'Skills must be an array' })
  @IsString({ each: true, message: 'Each skill must be a string' })
  skills?: string[];

  @ApiPropertyOptional({
    description: 'Companies',
    isArray: true,
    example: ['Google', 'Microsoft', 'Amazon'],
  })
  @IsOptional()
  @IsArray({ message: 'Companies must be an array' })
  @IsString({ each: true, message: 'Each company must be a string' })
  companies?: string[];

  @ApiPropertyOptional({
    description: 'Posted date filter',
    type: DateFilterDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => DateFilterDto)
  postedDate?: DateFilterDto;

  @ApiPropertyOptional({
    description: 'Include jobs with no salary information',
    example: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'Include no salary must be a boolean' })
  @Type(() => Boolean)
  includeNoSalary?: boolean;

  @ApiPropertyOptional({
    description: 'Page number',
    example: 1,
    default: 1,
  })
  @IsOptional()
  @IsInt({ message: 'Page must be an integer' })
  @Min(1, { message: 'Page must be at least 1' })
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    example: 10,
    default: 10,
  })
  @IsOptional()
  @IsInt({ message: 'Limit must be an integer' })
  @Min(1, { message: 'Limit must be at least 1' })
  @Max(100, { message: 'Limit must be at most 100' })
  @Type(() => Number)
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Sort field',
    example: 'createdAt',
    default: 'createdAt',
  })
  @IsOptional()
  @IsString({ message: 'Sort field must be a string' })
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({
    description: 'Sort direction',
    example: 'desc',
    default: 'desc',
  })
  @IsOptional()
  @IsEnum(['asc', 'desc'], { message: 'Sort direction must be asc or desc' })
  sortDirection?: 'asc' | 'desc' = 'desc';

  @ApiPropertyOptional({
    description: 'Platform to search',
    example: ['linkedin', 'infojobs'],
  })
  @IsOptional()
  @IsArray({ message: 'Platforms must be an array' })
  @IsString({ each: true, message: 'Each platform must be a string' })
  @ArrayMinSize(1, { message: 'At least one platform is required' })
  @ArrayMaxSize(4, { message: 'At most 4 platforms are allowed' })
  platforms?: string[];
}
