import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateEmailDto {
  @ApiProperty({ description: 'Novo email' })
  @IsEmail({}, { message: 'Email inválido' })
  @IsNotEmpty({ message: 'Email é obrigatório' })
  newEmail: string;

  @ApiProperty({ description: 'Senha atual para confirmação' })
  @IsNotEmpty({ message: 'A senha é obrigatória para confirmar a alteração' })
  password: string;
}
