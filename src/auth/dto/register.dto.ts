import { IsEmail, IsNotEmpty, MinLength, Matches, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ description: 'Nome completo do usuário' })
  @IsNotEmpty({ message: 'O nome completo é obrigatório' })
  fullName: string;

  @ApiProperty({ description: 'Email do usuário' })
  @IsEmail({}, { message: 'Email inválido' })
  @IsNotEmpty({ message: 'Email é obrigatório' })
  email: string;

  @ApiProperty({ description: 'Senha do usuário' })
  @IsNotEmpty({ message: 'Senha é obrigatória' })
  @MinLength(8, { message: 'A senha deve ter pelo menos 8 caracteres' })
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'A senha deve conter pelo menos uma letra maiúscula, uma minúscula e um número ou caractere especial',
  })
  password: string;

  @ApiPropertyOptional({ description: 'Telefone do usuário' })
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ description: 'Localização do usuário' })
  @IsOptional()
  location?: string;
}
