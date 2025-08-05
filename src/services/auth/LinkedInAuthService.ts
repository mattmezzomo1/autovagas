import axios from 'axios';

/**
 * Interface para os tokens retornados pelo LinkedIn
 */
export interface LinkedInTokens {
  accessToken: string;
  expiresIn: number;
  refreshToken?: string;
}

/**
 * Serviço para autenticação com o LinkedIn usando OAuth 2.0
 */
export class LinkedInAuthService {
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;
  
  constructor() {
    this.clientId = process.env.LINKEDIN_CLIENT_ID || '';
    this.clientSecret = process.env.LINKEDIN_CLIENT_SECRET || '';
    this.redirectUri = process.env.LINKEDIN_REDIRECT_URI || '';
    
    if (!this.clientId || !this.clientSecret) {
      console.warn('LinkedIn client ID or client secret not set. LinkedIn authentication will not work.');
    }
  }
  
  /**
   * Gera a URL de autorização para o LinkedIn
   */
  getAuthorizationUrl(): string {
    const scope = 'r_emailaddress r_liteprofile r_fullprofile w_member_social';
    const state = this.generateRandomState();
    
    // Armazena o state para validação posterior
    // Em uma aplicação real, isso seria armazenado em uma sessão ou cookie
    localStorage.setItem('linkedin_auth_state', state);
    
    return `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${this.clientId}&redirect_uri=${encodeURIComponent(this.redirectUri)}&state=${state}&scope=${encodeURIComponent(scope)}`;
  }
  
  /**
   * Troca o código de autorização por tokens de acesso
   */
  async exchangeCodeForToken(code: string, state: string): Promise<LinkedInTokens> {
    // Valida o state para prevenir CSRF
    const storedState = localStorage.getItem('linkedin_auth_state');
    if (state !== storedState) {
      throw new Error('Invalid state parameter');
    }
    
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
