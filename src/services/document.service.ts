import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

export interface ResumeData {
  id?: string;
  content: string;
  format: 'markdown' | 'html' | 'pdf';
  isGeneratedByAi: boolean;
  metadata?: {
    lastModified: string;
    version: number;
    wordCount: number;
  };
}

export interface AIImproveRequest {
  currentContent: string;
  userProfile: {
    fullName: string;
    title: string;
    email: string;
    phone: string;
    location: string;
    bio: string;
    experience: number;
    skills: string[];
    salaryExpectation?: {
      min: number;
      max: number;
    };
  };
  improvementType: 'general' | 'ats-optimized' | 'creative' | 'technical';
}

export interface AIImproveResponse {
  improvedContent: string;
  improvements: {
    category: string;
    description: string;
    impact: 'low' | 'medium' | 'high';
  }[];
  score: {
    original: number;
    improved: number;
  };
}

class DocumentService {
  private getAuthHeaders() {
    const token = localStorage.getItem('authToken');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  private getFileUploadHeaders() {
    const token = localStorage.getItem('authToken');
    return {
      'Authorization': `Bearer ${token}`,
    };
  }

  /**
   * Salva ou atualiza o currículo do usuário
   */
  async saveResume(resumeData: ResumeData): Promise<ResumeData> {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/documents/resume`,
        resumeData,
        { headers: this.getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Erro ao salvar currículo:', error);
      throw new Error('Falha ao salvar currículo');
    }
  }

  /**
   * Obtém o currículo atual do usuário
   */
  async getResume(): Promise<ResumeData | null> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/documents/resume`,
        { headers: this.getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null; // Usuário não tem currículo ainda
      }
      console.error('Erro ao obter currículo:', error);
      throw new Error('Falha ao obter currículo');
    }
  }

  /**
   * Atualiza um currículo existente
   */
  async updateResume(resumeId: string, resumeData: Partial<ResumeData>): Promise<ResumeData> {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/documents/resume/${resumeId}`,
        resumeData,
        { headers: this.getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar currículo:', error);
      throw new Error('Falha ao atualizar currículo');
    }
  }

  /**
   * Melhora o currículo usando IA
   */
  async improveResumeWithAI(request: AIImproveRequest): Promise<AIImproveResponse> {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/documents/resume/improve`,
        request,
        { headers: this.getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Erro ao melhorar currículo com IA:', error);
      throw new Error('Falha ao melhorar currículo com IA');
    }
  }

  /**
   * Faz upload de arquivo PDF do currículo
   */
  async uploadResumePDF(file: File): Promise<{ url: string; documentId: string; extractedText?: string }> {
    try {
      const formData = new FormData();
      formData.append('resume', file);

      const response = await axios.post(
        `${API_BASE_URL}/documents/resume/upload`,
        formData,
        { headers: this.getFileUploadHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Erro ao fazer upload do PDF:', error);
      throw new Error('Falha ao fazer upload do PDF');
    }
  }

  /**
   * Gera e baixa PDF do currículo
   */
  async downloadResumePDF(resumeId?: string): Promise<Blob> {
    try {
      const url = resumeId
        ? `${API_BASE_URL}/documents/resume/${resumeId}/pdf`
        : `${API_BASE_URL}/documents/resume/pdf`;

      const response = await axios.get(url, {
        headers: this.getAuthHeaders(),
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao baixar PDF:', error);
      throw new Error('Falha ao baixar PDF');
    }
  }

  /**
   * Converte markdown para PDF
   */
  async convertMarkdownToPDF(content: string, filename: string = 'curriculo.pdf'): Promise<Blob> {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/documents/convert/markdown-to-pdf`,
        { content, filename },
        {
          headers: this.getAuthHeaders(),
          responseType: 'blob',
        }
      );
      return response.data;
    } catch (error) {
      console.error('Erro ao converter para PDF:', error);
      throw new Error('Falha ao converter para PDF');
    }
  }

  /**
   * Extrai texto de PDF
   */
  async extractTextFromPDF(file: File): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('pdf', file);

      const response = await axios.post(
        `${API_BASE_URL}/documents/extract-text`,
        formData,
        { headers: this.getFileUploadHeaders() }
      );
      return response.data.text;
    } catch (error) {
      console.error('Erro ao extrair texto do PDF:', error);
      throw new Error('Falha ao extrair texto do PDF');
    }
  }

  /**
   * Lista histórico de versões do currículo
   */
  async getResumeHistory(): Promise<ResumeData[]> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/documents/resume/history`,
        { headers: this.getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Erro ao obter histórico:', error);
      throw new Error('Falha ao obter histórico');
    }
  }

  /**
   * Analisa currículo para ATS (Applicant Tracking System)
   */
  async analyzeForATS(content: string): Promise<{
    score: number;
    suggestions: string[];
    keywords: string[];
    missingKeywords: string[];
  }> {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/documents/resume/analyze-ats`,
        { content },
        { headers: this.getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Erro ao analisar para ATS:', error);
      throw new Error('Falha ao analisar para ATS');
    }
  }
}

export const documentService = new DocumentService();
