import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
  IsEnum,
  ValidateIf,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsValidPassword } from '../../common/validators/is-valid-password.validator';
import { Match } from '../../common/validators/match.validator';
import { IsNotExists } from '../../common/validators/is-not-exists.validator';
import { User, UserRole } from '../entities/user.entity';

export class UpdateUserDto {
  @ApiPropertyOptional({
    description: 'User email address',
    example: 'user@example.com',
  })
  @IsOptional()
  @IsEmail({}, { message: 'Invalid email format' })
  @IsNotExists(User, 'email', { message: 'Email already exists' })
  email?: string;

  @ApiPropertyOptional({
    description: 'User current password (required to change password)',
    example: 'CurrentP@ssw0rd',
  })
  @ValidateIf(o => o.password !== undefined)
  @IsString({ message: 'Current password must be a string' })
  currentPassword?: string;

  @ApiPropertyOptional({
    description: 'User new password',
    example: 'NewStrongP@ssw0rd',
  })
  @IsOptional()
  @IsString({ message: 'Password must be a string' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @MaxLength(100, { message: 'Password must be at most 100 characters long' })
  @IsValidPassword()
  password?: string;

  @ApiPropertyOptional({
    description: 'Confirm new password',
    example: 'NewStrongP@ssw0rd',
  })
  @ValidateIf(o => o.password !== undefined)
  @Match('password', { message: 'Passwords do not match' })
  confirmPassword?: string;

  @ApiPropertyOptional({
    description: 'User full name',
    example: 'John Doe',
  })
  @IsOptional()
  @IsString({ message: 'Name must be a string' })
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  @MaxLength(100, { message: 'Name must be at most 100 characters long' })
  name?: string;

  @ApiPropertyOptional({
    description: 'User role (admin only)',
    enum: UserRole,
  })
  @IsOptional()
  @IsEnum(UserRole, { message: 'Invalid role' })
  role?: UserRole;
}
