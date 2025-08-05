import { IsOptional, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class UpdatePreferencesDto {
  @ApiPropertyOptional({
    description: 'Habilitar aplicação automática',
    type: Boolean,
    example: true
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  autoApplyEnabled?: boolean;

  @ApiPropertyOptional({
    description: 'Receber notificações por email',
    type: Boolean,
    example: true
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  emailNotificationsEnabled?: boolean;

  @ApiPropertyOptional({
    description: 'Receber notificações push',
    type: Boolean,
    example: true
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  pushNotificationsEnabled?: boolean;

  @ApiPropertyOptional({
    description: 'Perfil visível para empresas',
    type: Boolean,
    example: true
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  profileVisible?: boolean;
}
