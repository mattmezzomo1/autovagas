import axios from 'axios';
import { TokenStorage } from '../auth/TokenStorage';
import { LinkedInAuthService } from '../auth/LinkedInAuthService';
import { JobSearchParams, ApplicationResult } from '../webscraper/types';

/**
 * Interface para uma vaga do LinkedIn
 */
export interface LinkedInJob {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  applicationUrl: string;
  postedDate: Date;
  salary?: string;
  jobType?: string;
  workModel?: string;
  requirements?: string[];
}

/**
 * Interface para o perfil do usuário no LinkedIn
 */
export interface LinkedInUserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  profileUrl: string;
  headline?: string;
  industry?: string;
  location?: string;
}

/**
 * Serviço para interagir com a API oficial do LinkedIn
 */
export class LinkedInApiService {
  private userId: string;
  private authService: LinkedInAuthService;
  
  constructor(userId: string) {
    this.userId = userId;
    this.authService = new LinkedInAuthService();
  }
  
  /**
   * Obtém o token de acesso, renovando se necessário
   */
  private async getAccessToken(): Promise<string> {
    if (TokenStorage.areTokensExpired(this.userId, 'linkedin')) {
      const tokens = TokenStorage.getTokens(this.userId, 'linkedin');
      if (!tokens || !tokens.refreshToken) {
        throw new Error('No refresh token available');
      }
      
      const newTokens = await this.authService.refreshAccessToken(tokens.refreshToken);
      TokenStorage.storeTokens(this.userId, 'linkedin', newTokens);
      return newTokens.accessToken;
    }
    
    const tokens = TokenStorage.getTokens(this.userId, 'linkedin');
    if (!tokens) {
      throw new Error('No access token available');
    }
    
    return tokens.accessToken;
  }
  
  /**
   * Busca vagas no LinkedIn com base nos parâmetros
   */
  async searchJobs(params: JobSearchParams): Promise<LinkedInJob[]> {
    try {
      const accessToken = await this.getAccessToken();
      
      // Construir os parâmetros de busca
      const searchParams: any = {};
      
      if (params.keywords && params.keywords.length > 0) {
        searchParams.keywords = params.keywords.join(' ');
      }
      
      if (params.locations && params.locations.length > 0) {
        searchParams.location = params.locations.join(',');
      }
      
      // Adicionar outros parâmetros conforme necessário
      if (params.remote) {
        searchParams.remoteFilter = 'true';
      }
      
      // Fazer a requisição para a API do LinkedIn
      // Nota: A URL e os parâmetros exatos podem variar conforme a documentação da API do LinkedIn
      const response = await axios.get('https://api.linkedin.com/v2/jobSearch', {
        params: searchParams,
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'X-Restli-Protocol-Version': '2.0.0'
        }
      });
      
      // Processar e mapear os resultados
      if (response.data && response.data.elements) {
        return response.data.elements.map(this.mapJobData);
      }
      
      return [];
    } catch (error) {
      console.error('Error searching jobs on LinkedIn:', error);
      throw new Error('Failed to search jobs on LinkedIn');
    }
  }
  
  /**
   * Aplica para uma vaga no LinkedIn
   */
  async applyToJob(jobId: string, applicationData: any): Promise<ApplicationResult> {
    try {
      const accessToken = await this.getAccessToken();
      
      // Fazer a requisição para a API do LinkedIn
      // Nota: A URL e os parâmetros exatos podem variar conforme a documentação da API do LinkedIn
      const response = await axios.post(
        `https://api.linkedin.com/v2/jobs/${jobId}/applications`, 
        applicationData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'X-Restli-Protocol-Version': '2.0.0'
          }
        }
      );
      
      // Processar a resposta
      return {
        id: `linkedin-app-${Date.now()}`,
        jobId,
        platform: 'linkedin',
        title: applicationData.jobTitle || '',
        company: applicationData.company || '',
        status: 'success',
        appliedAt: new Date(),
        applicationUrl: `https://www.linkedin.com/jobs/view/${jobId}/`,
        matchScore: applicationData.matchScore || 0,
        resumeUsed: applicationData.resumeUrl || ''
      };
    } catch (error) {
      console.error(`Error applying to job ${jobId} on LinkedIn:`, error);
      
      return {
        id: `linkedin-app-${Date.now()}`,
        jobId,
        platform: 'linkedin',
        title: applicationData.jobTitle || '',
        company: applicationData.company || '',
        status: 'failed',
        appliedAt: new Date(),
        error: 'Failed to apply to job on LinkedIn',
        matchScore: applicationData.matchScore || 0,
        resumeUsed: applicationData.resumeUrl || ''
      };
    }
  }
  
  /**
   * Obtém o perfil do usuário no LinkedIn
   */
  async getUserProfile(): Promise<LinkedInUserProfile> {
    try {
      const accessToken = await this.getAccessToken();
      
      // Obter informações básicas do perfil
      const profileResponse = await axios.get('https://api.linkedin.com/v2/me', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'X-Restli-Protocol-Version': '2.0.0'
        }
      });
      
      // Obter o email do usuário
      const emailResponse = await axios.get(
        'https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))', 
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'X-Restli-Protocol-Version': '2.0.0'
          }
        }
      );
      
      const email = emailResponse.data.elements[0]['handle~'].emailAddress;
      const profile = profileResponse.data;
      
      return {
        id: profile.id,
        firstName: profile.localizedFirstName,
        lastName: profile.localizedLastName,
        email,
        profileUrl: `https://www.linkedin.com/in/${profile.vanityName || profile.id}/`,
        headline: profile.headline,
        industry: profile.industry,
        location: profile.location?.country?.code
      };
    } catch (error) {
      console.error('Error fetching LinkedIn user profile:', error);
      throw new Error('Failed to fetch LinkedIn user profile');
    }
  }
  
  /**
   * Mapeia os dados da vaga do formato da API para o formato interno
   */
  private mapJobData(jobData: any): LinkedInJob {
    // Nota: O formato exato dos dados pode variar conforme a documentação da API do LinkedIn
    return {
      id: jobData.entityUrn?.split(':').pop() || jobData.id,
      title: jobData.title?.text || jobData.title,
      company: jobData.companyDetails?.company?.name || jobData.company?.name,
      location: jobData.formattedLocation || jobData.location,
      description: jobData.description?.text || jobData.description,
      applicationUrl: `https://www.linkedin.com/jobs/view/${jobData.entityUrn?.split(':').pop() || jobData.id}/`,
      postedDate: new Date(jobData.listedAt || jobData.postedAt),
      salary: jobData.salary,
      jobType: jobData.jobType,
      workModel: jobData.workModel,
      requirements: jobData.requirements
    };
  }
}
