const documentService = require('../services/document.service');
const aiService = require('../services/ai.service');
const pdfService = require('../services/pdf.service');
const fs = require('fs').promises;
const path = require('path');

class DocumentController {
  /**
   * Salva um novo currículo
   */
  async saveResume(req, res) {
    try {
      const userId = req.user.id;
      const { content, format = 'markdown', metadata } = req.body;

      if (!content) {
        return res.status(400).json({
          success: false,
          message: 'Conteúdo do currículo é obrigatório'
        });
      }

      const resumeData = {
        userId,
        content,
        format,
        isGeneratedByAi: false,
        metadata: {
          ...metadata,
          lastModified: new Date().toISOString(),
          version: 1,
          wordCount: content.split(/\s+/).length
        }
      };

      const savedResume = await documentService.saveResume(resumeData);

      res.status(201).json({
        success: true,
        data: savedResume,
        message: 'Currículo salvo com sucesso'
      });
    } catch (error) {
      console.error('Erro ao salvar currículo:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Obtém o currículo atual do usuário
   */
  async getResume(req, res) {
    try {
      const userId = req.user.id;
      const resume = await documentService.getResumeByUserId(userId);

      if (!resume) {
        return res.status(404).json({
          success: false,
          message: 'Currículo não encontrado'
        });
      }

      res.json({
        success: true,
        data: resume
      });
    } catch (error) {
      console.error('Erro ao obter currículo:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Atualiza um currículo existente
   */
  async updateResume(req, res) {
    try {
      const userId = req.user.id;
      const resumeId = req.params.id;
      const { content, format, metadata } = req.body;

      // Verificar se o currículo pertence ao usuário
      const existingResume = await documentService.getResumeById(resumeId);
      if (!existingResume || existingResume.userId !== userId) {
        return res.status(404).json({
          success: false,
          message: 'Currículo não encontrado'
        });
      }

      const updateData = {
        content,
        format,
        metadata: {
          ...existingResume.metadata,
          ...metadata,
          lastModified: new Date().toISOString(),
          version: (existingResume.metadata?.version || 1) + 1,
          wordCount: content ? content.split(/\s+/).length : existingResume.metadata?.wordCount
        }
      };

      const updatedResume = await documentService.updateResume(resumeId, updateData);

      res.json({
        success: true,
        data: updatedResume,
        message: 'Currículo atualizado com sucesso'
      });
    } catch (error) {
      console.error('Erro ao atualizar currículo:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Melhora o currículo usando IA
   */
  async improveResumeWithAI(req, res) {
    try {
      const userId = req.user.id;
      const { currentContent, userProfile, improvementType = 'general' } = req.body;

      if (!currentContent) {
        return res.status(400).json({
          success: false,
          message: 'Conteúdo atual do currículo é obrigatório'
        });
      }

      // Chamar serviço de IA para melhorar o currículo
      const improvement = await aiService.improveResume({
        currentContent,
        userProfile,
        improvementType
      });

      // Salvar versão melhorada como nova versão
      const improvedResumeData = {
        userId,
        content: improvement.improvedContent,
        format: 'markdown',
        isGeneratedByAi: true,
        metadata: {
          lastModified: new Date().toISOString(),
          version: 1,
          wordCount: improvement.improvedContent.split(/\s+/).length,
          aiImprovements: improvement.improvements,
          originalScore: improvement.score.original,
          improvedScore: improvement.score.improved
        }
      };

      res.json({
        success: true,
        data: improvement,
        message: 'Currículo melhorado com sucesso'
      });
    } catch (error) {
      console.error('Erro ao melhorar currículo com IA:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao processar melhoria com IA'
      });
    }
  }

  /**
   * Faz upload de currículo em PDF
   */
  async uploadResumePDF(req, res) {
    try {
      const userId = req.user.id;
      const file = req.file;

      if (!file) {
        return res.status(400).json({
          success: false,
          message: 'Arquivo PDF é obrigatório'
        });
      }

      // Extrair texto do PDF
      const extractedText = await pdfService.extractText(file.path);

      // Salvar informações do documento
      const documentData = {
        userId,
        name: file.originalname,
        type: 'resume',
        path: file.path,
        mimeType: file.mimetype,
        size: file.size,
        isGeneratedByAi: false,
        metadata: {
          extractedText,
          uploadDate: new Date().toISOString()
        }
      };

      const savedDocument = await documentService.saveDocument(documentData);

      res.status(201).json({
        success: true,
        data: {
          documentId: savedDocument.id,
          url: `/api/documents/${savedDocument.id}/download`,
          extractedText
        },
        message: 'PDF carregado com sucesso'
      });
    } catch (error) {
      console.error('Erro ao fazer upload do PDF:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao processar upload do PDF'
      });
    }
  }

  /**
   * Gera PDF do currículo atual
   */
  async generateResumePDF(req, res) {
    try {
      const userId = req.user.id;
      const resume = await documentService.getResumeByUserId(userId);

      if (!resume) {
        return res.status(404).json({
          success: false,
          message: 'Currículo não encontrado'
        });
      }

      const pdfBuffer = await pdfService.generateFromMarkdown(resume.content);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="curriculo.pdf"');
      res.send(pdfBuffer);
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao gerar PDF'
      });
    }
  }

  /**
   * Converte markdown para PDF
   */
  async convertMarkdownToPDF(req, res) {
    try {
      const { content, filename = 'documento.pdf' } = req.body;

      if (!content) {
        return res.status(400).json({
          success: false,
          message: 'Conteúdo é obrigatório'
        });
      }

      const pdfBuffer = await pdfService.generateFromMarkdown(content);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(pdfBuffer);
    } catch (error) {
      console.error('Erro ao converter para PDF:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao converter para PDF'
      });
    }
  }

  /**
   * Extrai texto de PDF
   */
  async extractTextFromPDF(req, res) {
    try {
      const file = req.file;

      if (!file) {
        return res.status(400).json({
          success: false,
          message: 'Arquivo PDF é obrigatório'
        });
      }

      const extractedText = await pdfService.extractText(file.path);

      // Remover arquivo temporário
      await fs.unlink(file.path);

      res.json({
        success: true,
        data: { text: extractedText },
        message: 'Texto extraído com sucesso'
      });
    } catch (error) {
      console.error('Erro ao extrair texto:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao extrair texto do PDF'
      });
    }
  }

  /**
   * Obtém histórico de versões do currículo
   */
  async getResumeHistory(req, res) {
    try {
      const userId = req.user.id;
      const history = await documentService.getResumeHistory(userId);

      res.json({
        success: true,
        data: history
      });
    } catch (error) {
      console.error('Erro ao obter histórico:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao obter histórico'
      });
    }
  }

  /**
   * Analisa currículo para ATS
   */
  async analyzeForATS(req, res) {
    try {
      const { content } = req.body;

      if (!content) {
        return res.status(400).json({
          success: false,
          message: 'Conteúdo do currículo é obrigatório'
        });
      }

      const analysis = await aiService.analyzeForATS(content);

      res.json({
        success: true,
        data: analysis,
        message: 'Análise ATS concluída'
      });
    } catch (error) {
      console.error('Erro na análise ATS:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao analisar para ATS'
      });
    }
  }
}

module.exports = new DocumentController();
