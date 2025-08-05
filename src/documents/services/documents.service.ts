import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { Document, DocumentType, DocumentSource } from '../entities/document.entity';
import { CreateDocumentDto } from '../dto/create-document.dto';
import { UpdateDocumentDto } from '../dto/update-document.dto';
import { GetDocumentsDto } from '../dto/get-documents.dto';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(Document)
    private documentsRepository: Repository<Document>,
  ) {}

  async create(userId: string, createDocumentDto: CreateDocumentDto): Promise<Document> {
    // Se o documento for definido como padrão, desmarcar outros documentos do mesmo tipo
    if (createDocumentDto.isDefault) {
      await this.unsetDefaultDocuments(userId, createDocumentDto.type);
    }

    // Criar o documento
    const document = this.documentsRepository.create({
      ...createDocumentDto,
      userId,
    });

    return this.documentsRepository.save(document);
  }

  async findAll(userId: string, filters: GetDocumentsDto): Promise<any> {
    const {
      type,
      format,
      source,
      isActive = true,
      isDefault,
      page = 1,
      limit = 10,
    } = filters;

    // Construir condições de busca
    const where: FindOptionsWhere<Document> = { userId };

    if (type) {
      where.type = type;
    }

    if (format) {
      where.format = format;
    }

    if (source) {
      where.source = source;
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    if (isDefault !== undefined) {
      where.isDefault = isDefault;
    }

    // Calcular paginação
    const skip = (page - 1) * limit;

    // Executar consulta
    const [documents, total] = await this.documentsRepository.findAndCount({
      where,
      order: { updatedAt: 'DESC' },
      skip,
      take: limit,
    });

    // Calcular metadados de paginação
    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrevious = page > 1;

    return {
      data: documents,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNext,
        hasPrevious,
      },
    };
  }

  async findOne(id: string, userId: string): Promise<Document> {
    const document = await this.documentsRepository.findOne({
      where: { id, userId },
    });

    if (!document) {
      throw new NotFoundException(`Documento com ID ${id} não encontrado`);
    }

    return document;
  }

  async update(id: string, userId: string, updateDocumentDto: UpdateDocumentDto): Promise<Document> {
    const document = await this.findOne(id, userId);

    // Se o documento for definido como padrão, desmarcar outros documentos do mesmo tipo
    if (updateDocumentDto.isDefault) {
      await this.unsetDefaultDocuments(userId, document.type);
    }

    // Atualizar o documento
    Object.assign(document, updateDocumentDto);

    return this.documentsRepository.save(document);
  }

  async remove(id: string, userId: string): Promise<void> {
    const document = await this.findOne(id, userId);

    // Remover o documento
    await this.documentsRepository.remove(document);
  }

  async setAsDefault(id: string, userId: string): Promise<Document> {
    const document = await this.findOne(id, userId);

    // Desmarcar outros documentos do mesmo tipo
    await this.unsetDefaultDocuments(userId, document.type);

    // Marcar este documento como padrão
    document.isDefault = true;

    return this.documentsRepository.save(document);
  }

  async incrementUsageCount(id: string): Promise<void> {
    await this.documentsRepository.increment({ id }, 'usageCount', 1);
  }

  async getDefaultDocument(userId: string, type: DocumentType): Promise<Document | null> {
    return this.documentsRepository.findOne({
      where: { userId, type, isDefault: true, isActive: true },
    });
  }

  private async unsetDefaultDocuments(userId: string, type: DocumentType): Promise<void> {
    await this.documentsRepository.update(
      { userId, type, isDefault: true },
      { isDefault: false },
    );
  }

  async getDocumentStatistics(userId: string): Promise<any> {
    // Obter contagem total de documentos
    const totalDocuments = await this.documentsRepository.count({
      where: { userId },
    });

    // Obter contagem por tipo
    const typeCounts = {};
    for (const type of Object.values(DocumentType)) {
      typeCounts[type] = await this.documentsRepository.count({
        where: { userId, type },
      });
    }

    // Obter contagem por origem
    const sourceCounts = {};
    for (const source of Object.values(DocumentSource)) {
      sourceCounts[source] = await this.documentsRepository.count({
        where: { userId, source },
      });
    }

    // Obter documentos mais usados
    const mostUsedDocuments = await this.documentsRepository.find({
      where: { userId },
      order: { usageCount: 'DESC' },
      take: 5,
    });

    return {
      total: totalDocuments,
      byType: typeCounts,
      bySource: sourceCounts,
      mostUsed: mostUsedDocuments.map(doc => ({
        id: doc.id,
        name: doc.name,
        type: doc.type,
        usageCount: doc.usageCount,
      })),
    };
  }
}
