import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient } from '@supabase/supabase-js';
import * as crypto from 'crypto';
import { DocumentType, DocumentFormat, DocumentSource } from '../entities/document.entity';
import { DocumentsService } from './documents.service';
import { GenerateDocumentDto, ResumeGenerationOptions, CoverLetterGenerationOptions } from '../dto/generate-document.dto';
import { UsersService } from '../../users/services/users.service';
import { JobsService } from '../../jobs/services/jobs.service';
import axios from 'axios';

@Injectable()
export class DocumentGeneratorService {
  private supabase;
  private readonly bucketName = 'documents';
  private readonly aiApiKey: string;
  private readonly aiApiUrl: string;

  constructor(
    private configService: ConfigService,
    private documentsService: DocumentsService,
    private usersService: UsersService,
    private jobsService: JobsService,
  ) {
    this.supabase = createClient(
      this.configService.get<string>('supabase.url'),
      this.configService.get<string>('supabase.key'),
    );
    
    this.aiApiKey = this.configService.get<string>('ai.apiKey');
    this.aiApiUrl = this.configService.get<string>('ai.apiUrl');
    
    // Ensure bucket exists
    this.initBucket();
  }

  private async initBucket() {
    const { data, error } = await this.supabase.storage.getBucket(this.bucketName);
    
    if (error && error.statusCode === 404) {
      // Create bucket if it doesn't exist
      await this.supabase.storage.createBucket(this.bucketName, {
        public: true,
      });
    }
  }

  async generateDocument(userId: string, generateDto: GenerateDocumentDto): Promise<any> {
    // Validate document type and options
    if (generateDto.type === DocumentType.RESUME && !generateDto.resumeOptions) {
      throw new BadRequestException('Opções de currículo são obrigatórias para gerar um currículo');
    }

    if (generateDto.type === DocumentType.COVER_LETTER && !generateDto.coverLetterOptions) {
      throw new BadRequestException('Opções de carta de apresentação são obrigatórias para gerar uma carta');
    }

    // Get user data
    const user = await this.usersService.findById(userId);
    
    // Generate content based on document type
    let content: string;
    let metadata: any = {};
    
    if (generateDto.type === DocumentType.RESUME) {
      content = await this.generateResume(user, generateDto.resumeOptions, generateDto.baseContent);
      metadata = { options: generateDto.resumeOptions };
    } else if (generateDto.type === DocumentType.COVER_LETTER) {
      content = await this.generateCoverLetter(user, generateDto.coverLetterOptions, generateDto.baseContent);
      metadata = { options: generateDto.coverLetterOptions };
      
      // Add job data to metadata if jobId is provided
      if (generateDto.coverLetterOptions?.jobId) {
        try {
          const job = await this.jobsService.findOne(generateDto.coverLetterOptions.jobId);
          metadata.job = {
            id: job.id,
            title: job.title,
            companyName: job.companyName,
          };
        } catch (error) {
          // Job not found, continue without job data
        }
      }
    } else {
      throw new BadRequestException('Tipo de documento não suportado para geração com IA');
    }

    // Store content in Supabase Storage
    const fileName = await this.storeGeneratedContent(userId, generateDto.type, content, generateDto.format);
    
    // Get public URL
    const { data: urlData } = this.supabase.storage
      .from(this.bucketName)
      .getPublicUrl(fileName);

    // Create document record
    const document = await this.documentsService.create(userId, {
      name: generateDto.name,
      type: generateDto.type,
      format: generateDto.format,
      source: DocumentSource.AI_GENERATED,
      url: urlData.publicUrl,
      content,
      metadata: { ...metadata, ...generateDto.metadata },
      isDefault: generateDto.isDefault || false,
    });

    return document;
  }

  private async generateResume(user: any, options: ResumeGenerationOptions, baseContent?: string): Promise<string> {
    try {
      // Prepare user data for AI
      const userData = {
        fullName: user.fullName,
        title: user.title,
        experience: user.experience,
        skills: user.skills,
        bio: user.bio,
        education: user.education || '',
        workHistory: user.workHistory || '',
      };

      // Call AI API to generate resume
      const response = await axios.post(
        `${this.aiApiUrl}/generate-resume`,
        {
          userData,
          options,
          baseContent,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.aiApiKey}`,
            'Content-Type': 'application/json',
          },
        },
      );

      return response.data.content;
    } catch (error) {
      // Fallback to template-based generation if AI API fails
      return this.generateResumeFromTemplate(user, options);
    }
  }

  private async generateCoverLetter(user: any, options: CoverLetterGenerationOptions, baseContent?: string): Promise<string> {
    try {
      // Prepare user data for AI
      const userData = {
        fullName: user.fullName,
        title: user.title,
        experience: user.experience,
        skills: user.skills,
        bio: user.bio,
      };

      // Get job data if jobId is provided
      let jobData = null;
      if (options.jobId) {
        try {
          const job = await this.jobsService.findOne(options.jobId);
          jobData = {
            title: job.title,
            companyName: job.companyName,
            description: job.description,
            requirements: job.requirements,
          };
        } catch (error) {
          // Job not found, continue without job data
        }
      }

      // Call AI API to generate cover letter
      const response = await axios.post(
        `${this.aiApiUrl}/generate-cover-letter`,
        {
          userData,
          jobData,
          options,
          baseContent,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.aiApiKey}`,
            'Content-Type': 'application/json',
          },
        },
      );

      return response.data.content;
    } catch (error) {
      // Fallback to template-based generation if AI API fails
      return this.generateCoverLetterFromTemplate(user, options);
    }
  }

  private generateResumeFromTemplate(user: any, options: ResumeGenerationOptions): string {
    // Simple template-based generation as fallback
    const skills = user.skills ? user.skills.split(',').map(s => `- ${s.trim()}`).join('\\n') : '';
    
    return `# ${user.fullName}
## ${user.title || 'Profissional'}

${user.bio || ''}

### Habilidades
${skills}

### Experiência
${user.experience ? `${user.experience} anos de experiência` : 'Experiência profissional'}

### Contato
Email: ${user.email}
${user.phone ? `Telefone: ${user.phone}` : ''}
${user.location ? `Localização: ${user.location}` : ''}
`;
  }

  private generateCoverLetterFromTemplate(user: any, options: CoverLetterGenerationOptions): string {
    // Simple template-based generation as fallback
    const currentDate = new Date().toLocaleDateString();
    const highlightPoints = options.highlightPoints 
      ? options.highlightPoints.map(p => `- ${p}`).join('\\n')
      : '';
    
    return `# Carta de Apresentação

${currentDate}

Prezado(a) Recrutador(a),

Venho por meio desta carta expressar meu interesse em fazer parte da sua equipe.

${user.bio || ''}

Pontos de destaque:
${highlightPoints}

Agradeço a oportunidade e estou à disposição para uma entrevista.

Atenciosamente,
${user.fullName}
${user.email}
${user.phone || ''}
`;
  }

  private async storeGeneratedContent(
    userId: string,
    documentType: DocumentType,
    content: string,
    format: DocumentFormat,
  ): Promise<string> {
    // Convert content to the requested format
    let fileContent: Buffer;
    let contentType: string;
    let fileExtension: string;
    
    switch (format) {
      case DocumentFormat.MARKDOWN:
        fileContent = Buffer.from(content, 'utf-8');
        contentType = 'text/markdown';
        fileExtension = '.md';
        break;
      case DocumentFormat.HTML:
        fileContent = Buffer.from(this.convertMarkdownToHtml(content), 'utf-8');
        contentType = 'text/html';
        fileExtension = '.html';
        break;
      case DocumentFormat.TXT:
        fileContent = Buffer.from(this.convertMarkdownToText(content), 'utf-8');
        contentType = 'text/plain';
        fileExtension = '.txt';
        break;
      case DocumentFormat.PDF:
      case DocumentFormat.DOCX:
      default:
        // For PDF and DOCX, we'll just store the markdown version
        // In a real implementation, you would convert to PDF/DOCX
        fileContent = Buffer.from(content, 'utf-8');
        contentType = 'text/markdown';
        fileExtension = '.md';
        break;
    }

    // Generate unique filename
    const randomName = crypto.randomBytes(16).toString('hex');
    const fileName = `${userId}/${documentType.toLowerCase()}/generated_${randomName}${fileExtension}`;

    // Upload to Supabase Storage
    const { data, error } = await this.supabase.storage
      .from(this.bucketName)
      .upload(fileName, fileContent, {
        contentType,
        upsert: true,
      });

    if (error) {
      throw new BadRequestException(`Erro ao armazenar o conteúdo gerado: ${error.message}`);
    }

    return fileName;
  }

  private convertMarkdownToHtml(markdown: string): string {
    // Simple markdown to HTML conversion
    // In a real implementation, you would use a proper markdown parser
    let html = markdown
      .replace(/^# (.*?)$/gm, '<h1>$1</h1>')
      .replace(/^## (.*?)$/gm, '<h2>$1</h2>')
      .replace(/^### (.*?)$/gm, '<h3>$1</h3>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/- (.*?)$/gm, '<li>$1</li>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>');
    
    html = `<html><body><p>${html}</p></body></html>`;
    return html;
  }

  private convertMarkdownToText(markdown: string): string {
    // Simple markdown to plain text conversion
    return markdown
      .replace(/^# (.*?)$/gm, '$1\n')
      .replace(/^## (.*?)$/gm, '$1\n')
      .replace(/^### (.*?)$/gm, '$1\n')
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/- (.*?)$/gm, '- $1');
  }
}
