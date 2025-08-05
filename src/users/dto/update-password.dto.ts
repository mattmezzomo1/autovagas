import { IsNotEmpty, MinLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePasswordDto {
  @ApiProperty({ description: 'Senha atual' })
  @IsNotEmpty({ message: 'A senha atual é obrigatória' })
  currentPassword: string;

  @ApiProperty({ description: 'Nova senha' })
  @IsNotEmpty({ message: 'A nova senha é obrigatória' })
  @MinLength(8, { message: 'A senha deve ter pelo menos 8 caracteres' })
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'A senha deve conter pelo menos uma letra maiúscula, uma minúscula e um número ou caractere especial',
  })
  newPassword: string;

  @ApiProperty({ description: 'Confirmação da nova senha' })
  @IsNotEmpty({ message: 'A confirmação da senha é obrigatória' })
  confirmPassword: string;
}
