import { PartialType } from '@nestjs/swagger';
import { CreateMatchCriteriaDto } from './create-match-criteria.dto';

export class UpdateMatchCriteriaDto extends PartialType(CreateMatchCriteriaDto) {}
