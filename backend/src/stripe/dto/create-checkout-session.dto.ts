import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsIn } from 'class-validator';

export class CreateCheckoutSessionDto {
  @ApiProperty({ description: 'Plan ID', enum: ['basic', 'plus', 'premium'] })
  @IsString()
  @IsIn(['basic', 'plus', 'premium'])
  planId: string;
}
