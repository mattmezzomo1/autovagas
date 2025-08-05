import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, IsBoolean, IsOptional } from 'class-validator';

export class SignupDto {
  @ApiProperty({ description: 'User email address' })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @ApiProperty({ description: 'User full name' })
  @IsString()
  @MinLength(3, { message: 'Full name must be at least 3 characters long' })
  fullName: string;

  @ApiProperty({ description: 'User password' })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password: string;

  @ApiProperty({ description: 'Whether the user is registering as a company', required: false, default: false })
  @IsBoolean()
  @IsOptional()
  isCompany: boolean = false;
}
