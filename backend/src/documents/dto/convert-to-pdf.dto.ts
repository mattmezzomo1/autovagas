import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class ConvertToPdfDto {
  @ApiProperty({
    description: 'Markdown content to convert to PDF',
    example: '# Document Title\n\nThis is the content of the document...',
  })
  @IsString()
  content: string;

  @ApiProperty({
    description: 'Filename for the generated PDF',
    example: 'my-document.pdf',
    default: 'documento.pdf',
  })
  @IsOptional()
  @IsString()
  filename?: string = 'documento.pdf';
}
