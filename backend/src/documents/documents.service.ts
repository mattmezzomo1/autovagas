import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document, DocumentType } from './entities/document.entity';
import { CreateDocumentDto } from './dto/create-document.dto';
import { GenerateDocumentDto } from './dto/generate-document.dto';
import { SaveResumeDto } from './dto/save-resume.dto';
import { StorageService } from '../storage/storage.service';
import { AiService } from '../ai/ai.service';
import { PdfService } from './pdf.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(Document)
    private documentsRepository: Repository<Document>,
    private storageService: StorageService,
    private aiService: AiService,
    private pdfService: PdfService,
    private usersService: UsersService,
  ) {}

  async create(userId: string, file: Express.Multer.File, createDocumentDto: CreateDocumentDto): Promise<Document> {
    // Upload file to storage
    const uploadResult = await this.storageService.uploadFile(file, 'documents');

    // Create document record
    const document = this.documentsRepository.create({
      userId,
      name: createDocumentDto.name || file.originalname,
      type: createDocumentDto.type || DocumentType.OTHER,
      path: uploadResult.path,
      mimeType: file.mimetype,
      size: file.size,
      metadata: {
        originalName: file.originalname,
        encoding: file.encoding,
      },
    });

    return this.documentsRepository.save(document);
  }

  async findAll(userId: string): Promise<Document[]> {
    return this.documentsRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, userId: string): Promise<Document> {
    const document = await this.documentsRepository.findOne({
      where: { id, userId },
    });

    if (!document) {
      throw new NotFoundException(`Document with ID ${id} not found`);
    }

    return document;
  }

  async remove(id: string, userId: string): Promise<void> {
    const document = await this.findOne(id, userId);

    // Delete file from storage
    await this.storageService.deleteFile(document.path);

    // Delete document record
    await this.documentsRepository.remove(document);
  }

  async generateDocument(userId: string, generateDocumentDto: GenerateDocumentDto): Promise<Document> {
    // Get user to check credits
    const user = await this.usersService.findById(userId);

    // Check if user has enough credits
    if (user.credits < 1) {
      throw new BadRequestException('Not enough credits to generate document');
    }

    // Generate document content using AI
    const documentContent = await this.aiService.generateDocument(
      generateDocumentDto.type,
      generateDocumentDto.content,
      user,
    );

    // Create a buffer from the generated content
    const buffer = Buffer.from(documentContent);

    // Create a file object
    const file: Express.Multer.File = {
      buffer,
      originalname: `${generateDocumentDto.name || 'generated-document'}.pdf`,
      mimetype: 'application/pdf',
      size: buffer.length,
      fieldname: 'file',
      encoding: '7bit',
      destination: '',
      filename: '',
      path: '',
      stream: null,
    };

    // Upload the generated document
    const uploadResult = await this.storageService.uploadFile(file, 'documents');

    // Create document record
    const document = this.documentsRepository.create({
      userId,
      name: generateDocumentDto.name || 'Generated Document',
      type: generateDocumentDto.type,
      path: uploadResult.path,
      mimeType: 'application/pdf',
      size: buffer.length,
      isGeneratedByAi: true,
      metadata: {
        prompt: generateDocumentDto.content,
        generatedAt: new Date().toISOString(),
      },
    });

    // Save document
    const savedDocument = await this.documentsRepository.save(document);

    // Deduct credits
    await this.usersService.updateCredits(userId, user.credits - 1);

    return savedDocument;
  }

  async getDocumentUrl(id: string, userId: string): Promise<string> {
    const document = await this.findOne(id, userId);

    // Generate a signed URL for the document
    return this.storageService.getSignedUrl(document.path);
  }

  // ===== RESUME METHODS =====

  async saveResume(userId: string, saveResumeDto: SaveResumeDto): Promise<Document> {
    const { content, format = 'markdown', isGeneratedByAi = false, metadata } = saveResumeDto;

    // Check if user already has a resume
    const existingResume = await this.documentsRepository.findOne({
      where: { userId, type: DocumentType.RESUME },
      order: { createdAt: 'DESC' },
    });

    if (existingResume) {
      // Update existing resume
      existingResume.metadata = {
        ...existingResume.metadata,
        content,
        format,
        ...metadata,
        lastModified: new Date().toISOString(),
        version: (existingResume.metadata?.version || 1) + 1,
        wordCount: content.split(/\s+/).length,
      };
      existingResume.isGeneratedByAi = isGeneratedByAi;
      existingResume.size = content.length;

      return this.documentsRepository.save(existingResume);
    } else {
      // Create new resume
      const document = this.documentsRepository.create({
        userId,
        name: 'Currículo',
        type: DocumentType.RESUME,
        path: '', // No file path for text-based resume
        mimeType: 'text/markdown',
        size: content.length,
        isGeneratedByAi,
        metadata: {
          content,
          format,
          ...metadata,
          lastModified: new Date().toISOString(),
          version: 1,
          wordCount: content.split(/\s+/).length,
        },
      });

      return this.documentsRepository.save(document);
    }
  }

  async getResume(userId: string): Promise<Document | null> {
    const resume = await this.documentsRepository.findOne({
      where: { userId, type: DocumentType.RESUME },
      order: { createdAt: 'DESC' },
    });

    return resume || null;
  }

  async getResumeById(resumeId: string, userId: string): Promise<Document | null> {
    const resume = await this.documentsRepository.findOne({
      where: { id: resumeId, userId, type: DocumentType.RESUME },
    });

    return resume || null;
  }

  async updateResume(resumeId: string, userId: string, saveResumeDto: SaveResumeDto): Promise<Document> {
    const resume = await this.getResumeById(resumeId, userId);

    if (!resume) {
      throw new NotFoundException('Resume not found');
    }

    const { content, format, isGeneratedByAi, metadata } = saveResumeDto;

    resume.metadata = {
      ...resume.metadata,
      content,
      format,
      ...metadata,
      lastModified: new Date().toISOString(),
      version: (resume.metadata?.version || 1) + 1,
      wordCount: content ? content.split(/\s+/).length : resume.metadata?.wordCount,
    };

    if (isGeneratedByAi !== undefined) {
      resume.isGeneratedByAi = isGeneratedByAi;
    }

    if (content) {
      resume.size = content.length;
    }

    return this.documentsRepository.save(resume);
  }

  async uploadResumePDF(userId: string, file: Express.Multer.File): Promise<{ documentId: string; url: string; extractedText: string }> {
    // Extract text from PDF
    const extractedText = await this.pdfService.extractText(file.buffer);

    // Upload file to storage
    const uploadResult = await this.storageService.uploadFile(file, 'documents');

    // Create document record
    const document = this.documentsRepository.create({
      userId,
      name: file.originalname,
      type: DocumentType.RESUME,
      path: uploadResult.path,
      mimeType: file.mimetype,
      size: file.size,
      isGeneratedByAi: false,
      metadata: {
        extractedText,
        uploadDate: new Date().toISOString(),
        originalName: file.originalname,
      },
    });

    const savedDocument = await this.documentsRepository.save(document);

    return {
      documentId: savedDocument.id,
      url: `/api/documents/${savedDocument.id}/download`,
      extractedText,
    };
  }

  async getResumeHistory(userId: string): Promise<Document[]> {
    return this.documentsRepository.find({
      where: { userId, type: DocumentType.RESUME },
      order: { createdAt: 'DESC' },
    });
  }

  async saveResumeVersion(userId: string, content: string, metadata: any = {}): Promise<Document> {
    const versionData: SaveResumeDto = {
      content,
      format: 'markdown',
      isGeneratedByAi: metadata.isGeneratedByAi || false,
      metadata: {
        isVersion: true,
        ...metadata,
      },
    };

    const document = this.documentsRepository.create({
      userId,
      name: `Currículo - Versão ${new Date().toISOString()}`,
      type: DocumentType.RESUME,
      path: '',
      mimeType: 'text/markdown',
      size: content.length,
      isGeneratedByAi: versionData.isGeneratedByAi,
      metadata: {
        content,
        format: 'markdown',
        isVersion: true,
        ...metadata,
      },
    });

    return this.documentsRepository.save(document);
  }

  async searchDocuments(userId: string, filters: any = {}): Promise<Document[]> {
    const queryBuilder = this.documentsRepository.createQueryBuilder('document')
      .where('document.userId = :userId', { userId });

    if (filters.type) {
      queryBuilder.andWhere('document.type = :type', { type: filters.type });
    }

    if (filters.search) {
      queryBuilder.andWhere('document.name ILIKE :search', { search: `%${filters.search}%` });
    }

    if (filters.isGeneratedByAi !== undefined) {
      queryBuilder.andWhere('document.isGeneratedByAi = :isGeneratedByAi', {
        isGeneratedByAi: filters.isGeneratedByAi
      });
    }

    queryBuilder.orderBy('document.createdAt', 'DESC');

    if (filters.limit) {
      queryBuilder.limit(filters.limit);
    }

    return queryBuilder.getMany();
  }
}
