import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  HttpCode,
  ParseUUIDPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { DocumentsService } from '../services/documents.service';
import { DocumentUploadService } from '../services/document-upload.service';
import { DocumentGeneratorService } from '../services/document-generator.service';
import { UpdateDocumentDto } from '../dto/update-document.dto';
import { GenerateDocumentDto } from '../dto/generate-document.dto';
import { GetDocumentsDto } from '../dto/get-documents.dto';
import { DocumentType } from '../entities/document.entity';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Request } from 'express';

@ApiTags('documents')
@Controller('documents')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DocumentsController {
  constructor(
    private readonly documentsService: DocumentsService,
    private readonly documentUploadService: DocumentUploadService,
    private readonly documentGeneratorService: DocumentGeneratorService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Listar documentos do usuário' })
  @ApiResponse({ status: 200, description: 'Lista de documentos' })
  async findAll(@Req() req: Request, @Query() filters: GetDocumentsDto) {
    return this.documentsService.findAll(req.user.sub, filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter detalhes de um documento' })
  @ApiResponse({ status: 200, description: 'Detalhes do documento' })
  @ApiResponse({ status: 404, description: 'Documento não encontrado' })
  async findOne(@Param('id', ParseUUIDPipe) id: string, @Req() req: Request) {
    return this.documentsService.findOne(id, req.user.sub);
  }

  @Post('upload')
  @ApiOperation({ summary: 'Fazer upload de um documento' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        type: {
          type: 'string',
          enum: Object.values(DocumentType),
          default: DocumentType.RESUME,
        },
        name: {
          type: 'string',
        },
        isDefault: {
          type: 'boolean',
          default: false,
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Documento enviado com sucesso' })
  @ApiResponse({ status: 400, description: 'Arquivo inválido' })
  @UseInterceptors(FileInterceptor('file'))
  async uploadDocument(
    @Req() req: Request,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }), // 10MB
          new FileTypeValidator({ 
            fileType: /(pdf|docx|txt|html|md|markdown)$/i,
          }),
        ],
      }),
    )
    file: Express.Multer.File,
    @Body('type') type: DocumentType = DocumentType.RESUME,
    @Body('name') name?: string,
    @Body('isDefault') isDefault?: boolean,
  ) {
    return this.documentUploadService.uploadDocument(
      req.user.sub,
      file,
      type,
      name,
      isDefault === 'true' || isDefault === true,
    );
  }

  @Post('generate')
  @ApiOperation({ summary: 'Gerar documento com IA' })
  @ApiResponse({ status: 201, description: 'Documento gerado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  async generateDocument(
    @Req() req: Request,
    @Body() generateDto: GenerateDocumentDto,
  ) {
    return this.documentGeneratorService.generateDocument(req.user.sub, generateDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar um documento' })
  @ApiResponse({ status: 200, description: 'Documento atualizado com sucesso' })
  @ApiResponse({ status: 404, description: 'Documento não encontrado' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: Request,
    @Body() updateDocumentDto: UpdateDocumentDto,
  ) {
    return this.documentsService.update(id, req.user.sub, updateDocumentDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Excluir um documento' })
  @ApiResponse({ status: 204, description: 'Documento excluído com sucesso' })
  @ApiResponse({ status: 404, description: 'Documento não encontrado' })
  @HttpCode(204)
  async remove(@Param('id', ParseUUIDPipe) id: string, @Req() req: Request) {
    return this.documentUploadService.deleteDocument(id, req.user.sub);
  }

  @Put(':id/default')
  @ApiOperation({ summary: 'Definir documento como padrão' })
  @ApiResponse({ status: 200, description: 'Documento definido como padrão' })
  @ApiResponse({ status: 404, description: 'Documento não encontrado' })
  async setAsDefault(@Param('id', ParseUUIDPipe) id: string, @Req() req: Request) {
    return this.documentsService.setAsDefault(id, req.user.sub);
  }

  @Get('default/:type')
  @ApiOperation({ summary: 'Obter documento padrão por tipo' })
  @ApiResponse({ status: 200, description: 'Documento padrão' })
  @ApiResponse({ status: 404, description: 'Documento padrão não encontrado' })
  async getDefaultDocument(
    @Param('type') type: DocumentType,
    @Req() req: Request,
  ) {
    const document = await this.documentsService.getDefaultDocument(req.user.sub, type);
    
    if (!document) {
      return { message: `Nenhum documento padrão do tipo ${type} encontrado` };
    }
    
    return document;
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Obter estatísticas de documentos' })
  @ApiResponse({ status: 200, description: 'Estatísticas de documentos' })
  async getDocumentStatistics(@Req() req: Request) {
    return this.documentsService.getDocumentStatistics(req.user.sub);
  }
}
