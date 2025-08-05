# Implementação da Integração com LinkedIn

Este documento detalha a implementação da integração com o LinkedIn, incluindo autenticação OAuth 2.0, uso da API oficial e implementação do scraper como fallback.

## 1. Autenticação OAuth 2.0

### Registro do Aplicativo
1. Acessar o [Portal de Desenvolvedores do LinkedIn](https://www.linkedin.com/developers/)
2. Criar um novo aplicativo com as seguintes configurações:
   - Nome do aplicativo: AutoVagas
   - URL do site: https://autovagas.com.br
   - Logo do aplicativo: Logo da AutoVagas
   - Descrição: Plataforma de busca e aplicação automatizada em vagas de emprego
3. Solicitar as seguintes permissões:
   - `r_emailaddress`: Para acessar o email do usuário
   - `r_liteprofile`: Para acessar informações básicas do perfil
   - `r_fullprofile`: Para acessar o perfil completo (requer aprovação)
   - `w_member_social`: Para aplicações em vagas (requer aprovação)
4. Configurar URLs de redirecionamento:
   - https://autovagas.com.br/auth/linkedin/callback
   - http://localhost:3000/auth/linkedin/callback (para desenvolvimento)

### Implementação do Fluxo OAuth 2.0
```typescript
// src/services/auth/LinkedInAuthService.ts
import axios from 'axios';

export class LinkedInAuthService {
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;

  constructor() {
    this.clientId = process.env.LINKEDIN_CLIENT_ID || '';
    this.clientSecret = process.env.LINKEDIN_CLIENT_SECRET || '';
    this.redirectUri = process.env.LINKEDIN_REDIRECT_URI || '';
  }

  /**
   * Gera a URL de autorização para o LinkedIn
   */
  getAuthorizationUrl(): string {
    const scope = 'r_emailaddress r_liteprofile r_fullprofile w_member_social';
    const state = this.generateRandomState();

    // Armazena o state para validação posterior
    // sessionStorage.setItem('linkedin_auth_state', state);

    return `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${this.clientId}&redirect_uri=${encodeURIComponent(this.redirectUri)}&state=${state}&scope=${encodeURIComponent(scope)}`;
  }

  /**
   * Troca o código de autorização por tokens de acesso
   */
  async exchangeCodeForToken(code: string, state: string): Promise<LinkedInTokens> {
    // Valida o state para prevenir CSRF
    // const storedState = sessionStorage.getItem('linkedin_auth_state');
    // if (state !== storedState) {
    //   throw new Error('Invalid state parameter');
    // }

    try {
      const response = await axios.post('https://www.linkedin.com/oauth/v2/accessToken', null, {
        params: {
          grant_type: 'authorization_code',
          code,
          redirect_uri: this.redirectUri,
          client_id: this.clientId,
          client_secret: this.clientSecret
        },
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      return {
        accessToken: response.data.access_token,
        expiresIn: response.data.expires_in,
        refreshToken: response.data.refresh_token
      };
    } catch (error) {
      console.error('Error exchanging code for token:', error);
      throw new Error('Failed to exchange authorization code for token');
    }
  }

  /**
   * Renova o token de acesso usando o refresh token
   */
  async refreshAccessToken(refreshToken: string): Promise<LinkedInTokens> {
    try {
      const response = await axios.post('https://www.linkedin.com/oauth/v2/accessToken', null, {
        params: {
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
          client_id: this.clientId,
          client_secret: this.clientSecret
        },
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      return {
        accessToken: response.data.access_token,
        expiresIn: response.data.expires_in,
        refreshToken: response.data.refresh_token || refreshToken
      };
    } catch (error) {
      console.error('Error refreshing token:', error);
      throw new Error('Failed to refresh access token');
    }
  }

  /**
   * Gera um string aleatória para o parâmetro state
   */
  private generateRandomState(): string {
    return Math.random().toString(36).substring(2, 15) +
           Math.random().toString(36).substring(2, 15);
  }
}

export interface LinkedInTokens {
  accessToken: string;
  expiresIn: number;
  refreshToken?: string;
}
```

### Armazenamento Seguro de Tokens
```typescript
// src/services/auth/TokenStorage.ts
import { encrypt, decrypt } from '../utils/encryption';

export class TokenStorage {
  /**
   * Armazena tokens de forma segura
   */
  static storeTokens(userId: string, platform: string, tokens: any): void {
    const encryptedTokens = encrypt(JSON.stringify(tokens));
    localStorage.setItem(`${platform}_tokens_${userId}`, encryptedTokens);

    // Armazena a data de expiração
    if (tokens.expiresIn) {
      const expiresAt = Date.now() + tokens.expiresIn * 1000;
      localStorage.setItem(`${platform}_expires_${userId}`, expiresAt.toString());
    }
  }

  /**
   * Recupera tokens armazenados
   */
  static getTokens(userId: string, platform: string): any | null {
    const encryptedTokens = localStorage.getItem(`${platform}_tokens_${userId}`);
    if (!encryptedTokens) return null;

    try {
      return JSON.parse(decrypt(encryptedTokens));
    } catch (error) {
      console.error('Error decrypting tokens:', error);
      return null;
    }
  }

  /**
   * Verifica se os tokens estão expirados
   */
  static areTokensExpired(userId: string, platform: string): boolean {
    const expiresAtStr = localStorage.getItem(`${platform}_expires_${userId}`);
    if (!expiresAtStr) return true;

    const expiresAt = parseInt(expiresAtStr, 10);
    // Considera expirado 5 minutos antes para dar margem de segurança
    return Date.now() > expiresAt - 5 * 60 * 1000;
  }

  /**
   * Remove tokens armazenados
   */
  static removeTokens(userId: string, platform: string): void {
    localStorage.removeItem(`${platform}_tokens_${userId}`);
    localStorage.removeItem(`${platform}_expires_${userId}`);
  }
}
## 2. Integração com a API Oficial do LinkedIn

A API do LinkedIn permite buscar vagas, aplicar em vagas e gerenciar o perfil do usuário. Abaixo está a implementação dos principais endpoints necessários.

### Serviço de API do LinkedIn

```typescript
// src/services/api/LinkedInApiService.ts
import axios from 'axios';
import { TokenStorage } from '../auth/TokenStorage';
import { LinkedInAuthService } from '../auth/LinkedInAuthService';

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

      const response = await axios.get('https://api.linkedin.com/v2/jobSearch', {
        params: {
          keywords: params.keywords?.join(' '),
          location: params.locations?.join(','),
          // Outros parâmetros de busca
        },
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });

      // Processa e retorna os resultados
      return response.data.elements.map(this.mapJobData);
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

      const response = await axios.post(`https://api.linkedin.com/v2/jobs/${jobId}/applications`,
        applicationData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

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

      const response = await axios.get('https://api.linkedin.com/v2/me', {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });

      // Obtém informações adicionais como email
      const emailResponse = await axios.get('https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))', {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });

      const email = emailResponse.data.elements[0]['handle~'].emailAddress;

      return {
        id: response.data.id,
        firstName: response.data.localizedFirstName,
        lastName: response.data.localizedLastName,
        email,
        profileUrl: `https://www.linkedin.com/in/${response.data.vanityName || response.data.id}/`
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
    return {
      id: jobData.entityUrn.split(':').pop(),
      title: jobData.title.text,
      company: jobData.companyDetails.company.name,
      location: jobData.formattedLocation,
      description: jobData.description.text,
      applicationUrl: `https://www.linkedin.com/jobs/view/${jobData.entityUrn.split(':').pop()}/`,
      postedDate: new Date(jobData.listedAt),
      // Outros campos
    };
  }
}

interface LinkedInJob {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  applicationUrl: string;
  postedDate: Date;
  // Outros campos
}

interface LinkedInUserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  profileUrl: string;
}
```

## 3. Implementação do Scraper como Fallback

Quando a API do LinkedIn não estiver disponível ou quando o usuário não tiver autorizado o acesso, podemos usar um scraper como fallback.

### Serviço de Scraping do LinkedIn

```typescript
// src/services/webscraper/LinkedInScraperService.ts
import { UserProfile } from '../../types/auth';
import { ApplicationResult, JobSearchParams, ScrapedJob, ScraperCredentials } from './types';
import { WebScraperService } from './WebScraperService';

/**
 * Serviço de webscraping específico para o LinkedIn
 */
export class LinkedInScraperService extends WebScraperService {