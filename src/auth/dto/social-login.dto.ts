import { IsNotEmpty, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SocialLoginDto {
  @ApiProperty({ description: 'Token de autenticação social' })
  @IsNotEmpty({ message: 'Token é obrigatório' })
  token: string;

  @ApiProperty({ description: 'Provedor de autenticação social', enum: ['google', 'linkedin'] })
  @IsNotEmpty({ message: 'Provedor é obrigatório' })
  @IsIn(['google', 'linkedin'], { message: 'Provedor deve ser google ou linkedin' })
  provider: 'google' | 'linkedin';
}
