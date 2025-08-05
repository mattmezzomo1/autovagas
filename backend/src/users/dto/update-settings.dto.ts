import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateSettingsDto {
  @ApiProperty({ description: 'Whether auto-apply is enabled', required: false })
  @IsBoolean()
  @IsOptional()
  autoApplyEnabled?: boolean;
}
