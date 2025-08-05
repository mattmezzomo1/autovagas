import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Res,
  StreamableFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { DocumentsService } from './documents.service';
import { PdfService } from './pdf.service';
import { AiService } from './ai.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';
import { CreateDocumentDto } from './dto/create-document.dto';
import { GenerateDocumentDto } from './dto/generate-document.dto';
import { SaveResumeDto } from './dto/save-resume.dto';
import { ImproveResumeDto } from './dto/improve-resume.dto';
import { ConvertToPdfDto } from './dto/convert-to-pdf.dto';
import { DocumentType } from './entities/document.entity';
import { getDocumentMulterConfig } from '../common/config/multer.config';

@ApiTags('Documents')
@Controller('documents')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DocumentsController {
  constructor(
    private readonly documentsService: DocumentsService,
    private readonly pdfService: PdfService,
    private readonly aiService: AiService,
    private readonly configService: ConfigService,
  ) {}

  @ApiOperation({ summary: 'Upload a document' })
  @ApiResponse({ status: 201, description: 'Document uploaded successfully' })
  @ApiResponse({ status: 400, description: 'Invalid file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        name: {
          type: 'string',
        },
        type: {
          type: 'string',
          enum: Object.values(DocumentType),
        },
      },
    },
  })
  @Post()
  @UseInterceptors(FileInterceptor('file', getDocumentMulterConfig(new ConfigService())))
  uploadDocument(
    @GetUser('id') userId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() createDocumentDto: CreateDocumentDto,
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    return this.documentsService.create(userId, file, createDocumentDto);
  }

  @ApiOperation({ summary: 'Get all user documents' })
  @ApiResponse({ status: 200, description: 'Returns all user documents' })
  @Get()
  findAll(@GetUser('id') userId: string) {
    return this.documentsService.findAll(userId);
  }

  @ApiOperation({ summary: 'Get a specific document' })
  @ApiResponse({ status: 200, description: 'Returns the document' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  @Get(':id')
  findOne(@Param('id') id: string, @GetUser('id') userId: string, @Res() res: Response) {
    return this.documentsService.getDocumentUrl(id, userId)
      .then(url => {
        res.redirect(url);
      });
  }

  @ApiOperation({ summary: 'Delete a document' })
  @ApiResponse({ status: 200, description: 'Document deleted successfully' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  @Delete(':id')
  remove(@Param('id') id: string, @GetUser('id') userId: string) {
    return this.documentsService.remove(id, userId);
  }

  @ApiOperation({ summary: 'Generate a document with AI' })
  @ApiResponse({ status: 201, description: 'Document generated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request or not enough credits' })
  @Post('generate')
  generateDocument(
    @GetUser('id') userId: string,
    @Body() generateDocumentDto: GenerateDocumentDto,
  ) {
    return this.documentsService.generateDocument(userId, generateDocumentDto);
  }

  // ===== RESUME ENDPOINTS =====

  @ApiOperation({ summary: 'Save or update resume' })
  @ApiResponse({ status: 201, description: 'Resume saved successfully' })
  @ApiResponse({ status: 400, description: 'Invalid resume data' })
  @Post('resume')
  saveResume(
    @GetUser('id') userId: string,
    @Body() saveResumeDto: SaveResumeDto,
  ) {
    return this.documentsService.saveResume(userId, saveResumeDto);
  }

  @ApiOperation({ summary: 'Get current user resume' })
  @ApiResponse({ status: 200, description: 'Returns user resume' })
  @ApiResponse({ status: 404, description: 'Resume not found' })
  @Get('resume')
  getResume(@GetUser('id') userId: string) {
    return this.documentsService.getResume(userId);
  }

  @ApiOperation({ summary: 'Update existing resume' })
  @ApiResponse({ status: 200, description: 'Resume updated successfully' })
  @ApiResponse({ status: 404, description: 'Resume not found' })
  @Put('resume/:id')
  updateResume(
    @Param('id') resumeId: string,
    @GetUser('id') userId: string,
    @Body() saveResumeDto: SaveResumeDto,
  ) {
    return this.documentsService.updateResume(resumeId, userId, saveResumeDto);
  }

  @ApiOperation({ summary: 'Upload resume PDF and extract text' })
  @ApiResponse({ status: 201, description: 'PDF uploaded and text extracted' })
  @ApiResponse({ status: 400, description: 'Invalid PDF file' })
  @ApiConsumes('multipart/form-data')
  @Post('resume/upload')
  @UseInterceptors(FileInterceptor('resume'))
  async uploadResumePDF(
    @GetUser('id') userId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('PDF file is required');
    }

    if (file.mimetype !== 'application/pdf') {
      throw new BadRequestException('Only PDF files are allowed');
    }

    return this.documentsService.uploadResumePDF(userId, file);
  }

  @ApiOperation({ summary: 'Improve resume with AI' })
  @ApiResponse({ status: 200, description: 'Resume improved successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @Post('resume/improve')
  improveResumeWithAI(
    @GetUser('id') userId: string,
    @Body() improveResumeDto: ImproveResumeDto,
  ) {
    return this.aiService.improveResume(improveResumeDto);
  }

  @ApiOperation({ summary: 'Generate PDF from current resume' })
  @ApiResponse({ status: 200, description: 'PDF generated successfully' })
  @ApiResponse({ status: 404, description: 'Resume not found' })
  @Get('resume/pdf')
  async generateResumePDF(
    @GetUser('id') userId: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const resume = await this.documentsService.getResume(userId);
    if (!resume) {
      throw new BadRequestException('Resume not found');
    }

    const pdfBuffer = await this.pdfService.generateFromMarkdown(resume.metadata.content);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="curriculo.pdf"',
    });

    return new StreamableFile(pdfBuffer);
  }

  @ApiOperation({ summary: 'Generate PDF from resume by ID' })
  @ApiResponse({ status: 200, description: 'PDF generated successfully' })
  @ApiResponse({ status: 404, description: 'Resume not found' })
  @Get('resume/:id/pdf')
  async generateResumePDFById(
    @Param('id') resumeId: string,
    @GetUser('id') userId: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const resume = await this.documentsService.getResumeById(resumeId, userId);
    if (!resume) {
      throw new BadRequestException('Resume not found');
    }

    const pdfBuffer = await this.pdfService.generateFromMarkdown(resume.metadata.content);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="curriculo.pdf"',
    });

    return new StreamableFile(pdfBuffer);
  }

  @ApiOperation({ summary: 'Convert markdown to PDF' })
  @ApiResponse({ status: 200, description: 'PDF generated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid markdown content' })
  @Post('convert/markdown-to-pdf')
  async convertMarkdownToPDF(
    @Body() convertToPdfDto: ConvertToPdfDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { content, filename = 'documento.pdf' } = convertToPdfDto;

    if (!content) {
      throw new BadRequestException('Content is required');
    }

    const pdfBuffer = await this.pdfService.generateFromMarkdown(content);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
    });

    return new StreamableFile(pdfBuffer);
  }

  @ApiOperation({ summary: 'Extract text from PDF' })
  @ApiResponse({ status: 200, description: 'Text extracted successfully' })
  @ApiResponse({ status: 400, description: 'Invalid PDF file' })
  @ApiConsumes('multipart/form-data')
  @Post('extract-text')
  @UseInterceptors(FileInterceptor('pdf'))
  async extractTextFromPDF(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('PDF file is required');
    }

    if (file.mimetype !== 'application/pdf') {
      throw new BadRequestException('Only PDF files are allowed');
    }

    const extractedText = await this.pdfService.extractText(file.buffer);

    return {
      success: true,
      data: { text: extractedText },
      message: 'Text extracted successfully',
    };
  }

  @ApiOperation({ summary: 'Get resume history/versions' })
  @ApiResponse({ status: 200, description: 'Returns resume history' })
  @Get('resume/history')
  getResumeHistory(@GetUser('id') userId: string) {
    return this.documentsService.getResumeHistory(userId);
  }

  @ApiOperation({ summary: 'Analyze resume for ATS compatibility' })
  @ApiResponse({ status: 200, description: 'ATS analysis completed' })
  @ApiResponse({ status: 400, description: 'Invalid content' })
  @Post('resume/analyze-ats')
  analyzeForATS(@Body('content') content: string) {
    if (!content) {
      throw new BadRequestException('Content is required');
    }

    return this.aiService.analyzeForATS(content);
  }
}
