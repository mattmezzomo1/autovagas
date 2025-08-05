import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsOptional, IsEnum, IsNumber, IsArray, IsBoolean } from 'class-validator';
import { UserRole, SubscriptionPlan } from '../entities/user.entity';

export class CreateUserDto {
  @ApiProperty({ description: 'User email address' })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @ApiProperty({ description: 'User full name' })
  @IsString()
  fullName: string;

  @ApiProperty({ description: 'User password' })
  @IsString()
  password: string;

  @ApiProperty({ description: 'User phone number', required: false })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ description: 'User location', required: false })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiProperty({ description: 'User professional title', required: false })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({ description: 'Years of professional experience', required: false })
  @IsNumber()
  @IsOptional()
  experience?: number;

  @ApiProperty({ description: 'User skills', required: false, type: [String] })
  @IsArray()
  @IsOptional()
  skills?: string[];

  @ApiProperty({ description: 'User bio or professional summary', required: false })
  @IsString()
  @IsOptional()
  bio?: string;

  @ApiProperty({ description: 'User role', enum: UserRole, default: UserRole.CANDIDATE })
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole = UserRole.CANDIDATE;

  @ApiProperty({ description: 'User subscription plan', enum: SubscriptionPlan, default: SubscriptionPlan.BASIC })
  @IsEnum(SubscriptionPlan)
  @IsOptional()
  subscriptionPlan?: SubscriptionPlan = SubscriptionPlan.BASIC;

  @ApiProperty({ description: 'Number of AI credits available', default: 10 })
  @IsNumber()
  @IsOptional()
  credits?: number = 10;

  @ApiProperty({ description: 'Whether auto-apply is enabled', default: false })
  @IsBoolean()
  @IsOptional()
  autoApplyEnabled?: boolean = false;
}
