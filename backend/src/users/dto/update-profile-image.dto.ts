import { ApiProperty } from '@nestjs/swagger';

export class UpdateProfileImageDto {
  @ApiProperty({ description: 'Profile image file', type: 'string', format: 'binary' })
  image: any;
}
