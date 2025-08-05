import { PartialType } from '@nestjs/swagger';
import { CreateAutoApplyConfigDto } from './create-auto-apply-config.dto';

export class UpdateAutoApplyConfigDto extends PartialType(CreateAutoApplyConfigDto) {}
