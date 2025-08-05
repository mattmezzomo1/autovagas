import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEmail, IsOptional } from 'class-validator';

export class LoginCredentialsDto {
  @ApiProperty({
    description: 'Username or email for the platform',
    example: 'user@example.com',
  })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({
    description: 'Password for the platform',
    example: 'mySecurePassword123',
  })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({
    description: 'Additional data that might be needed for some platforms',
    example: { rememberMe: true },
    required: false,
  })
  @IsOptional()
  additionalData?: Record<string, any>;
}
