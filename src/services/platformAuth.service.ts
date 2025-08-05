import axios from 'axios';

export interface PlatformCredentials {
  username: string;
  password: string;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: Date;
}

export interface PlatformConnection {
  platform: string;
  isConnected: boolean;
  connectedAt?: Date;
  lastSync?: Date;
  credentials?: PlatformCredentials;
}

export interface AuthResult {
  success: boolean;
  message: string;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: Date;
}

class PlatformAuthService {
  private readonly API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';
  
  private getAuthHeaders() {
    const token = localStorage.getItem('authToken');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  /**
   * Conecta com LinkedIn usando OAuth 2.0
   */
  async connectLinkedIn(): Promise<AuthResult> {
    try {
      // Gera URL de autorização OAuth
      const response = await axios.get(`${this.API_BASE_URL}/auth/linkedin/url`, {
        headers: this.getAuthHeaders()
      });

      const { authUrl, state } = response.data;
      
      // Armazena o state para validação
      sessionStorage.setItem('linkedin_auth_state', state);
      
      // Abre popup para autenticação
      const popup = window.open(
        authUrl,
        'linkedin-auth',
        'width=600,height=700,scrollbars=yes,resizable=yes'
      );

      return new Promise((resolve) => {
        const checkClosed = setInterval(() => {
          if (popup?.closed) {
            clearInterval(checkClosed);
            
            // Verifica se a autenticação foi bem-sucedida
            const authResult = sessionStorage.getItem('linkedin_auth_result');
            if (authResult) {
              const result = JSON.parse(authResult);
              sessionStorage.removeItem('linkedin_auth_result');
              sessionStorage.removeItem('linkedin_auth_state');
              
              if (result.success) {
                this.saveConnection('linkedin', {
                  isConnected: true,
                  connectedAt: new Date(),
                  credentials: {
                    username: result.email || '',
                    password: '',
                    accessToken: result.accessToken,
                    refreshToken: result.refreshToken,
                    expiresAt: result.expiresAt ? new Date(result.expiresAt) : undefined
                  }
                });
              }
              
              resolve(result);
            } else {
              resolve({
                success: false,
                message: 'Autenticação cancelada pelo usuário'
              });
            }
          }
        }, 1000);

        // Timeout após 5 minutos
        setTimeout(() => {
          clearInterval(checkClosed);
          popup?.close();
          resolve({
            success: false,
            message: 'Timeout na autenticação'
          });
        }, 300000);
      });
    } catch (error) {
      console.error('Erro ao conectar com LinkedIn:', error);
      return {
        success: false,
        message: 'Erro ao iniciar autenticação com LinkedIn'
      };
    }
  }

  /**
   * Conecta com InfoJobs usando credenciais
   */
  async connectInfoJobs(credentials: { username: string; password: string }): Promise<AuthResult> {
    try {
      const response = await axios.post(`${this.API_BASE_URL}/auth/infojobs/login`, credentials, {
        headers: this.getAuthHeaders()
      });

      if (response.data.success) {
        this.saveConnection('infojobs', {
          isConnected: true,
          connectedAt: new Date(),
          credentials: {
            username: credentials.username,
            password: credentials.password,
            accessToken: response.data.accessToken
          }
        });
      }

      return response.data;
    } catch (error) {
      console.error('Erro ao conectar com InfoJobs:', error);
      return {
        success: false,
        message: 'Erro ao conectar com InfoJobs. Verifique suas credenciais.'
      };
    }
  }

  /**
   * Conecta com Catho usando credenciais
   */
  async connectCatho(credentials: { username: string; password: string }): Promise<AuthResult> {
    try {
      const response = await axios.post(`${this.API_BASE_URL}/auth/catho/login`, credentials, {
        headers: this.getAuthHeaders()
      });

      if (response.data.success) {
        this.saveConnection('catho', {
          isConnected: true,
          connectedAt: new Date(),
          credentials: {
            username: credentials.username,
            password: credentials.password,
            accessToken: response.data.accessToken
          }
        });
      }

      return response.data;
    } catch (error) {
      console.error('Erro ao conectar com Catho:', error);
      return {
        success: false,
        message: 'Erro ao conectar com Catho. Verifique suas credenciais.'
      };
    }
  }

  /**
   * Conecta com Indeed usando credenciais
   */
  async connectIndeed(credentials: { username: string; password: string }): Promise<AuthResult> {
    try {
      const response = await axios.post(`${this.API_BASE_URL}/auth/indeed/login`, credentials, {
        headers: this.getAuthHeaders()
      });

      if (response.data.success) {
        this.saveConnection('indeed', {
          isConnected: true,
          connectedAt: new Date(),
          credentials: {
            username: credentials.username,
            password: credentials.password,
            accessToken: response.data.accessToken
          }
        });
      }

      return response.data;
    } catch (error) {
      console.error('Erro ao conectar com Indeed:', error);
      return {
        success: false,
        message: 'Erro ao conectar com Indeed. Verifique suas credenciais.'
      };
    }
  }

  /**
   * Conecta com Vagas.com usando credenciais
   */
  async connectVagas(credentials: { username: string; password: string }): Promise<AuthResult> {
    try {
      const response = await axios.post(`${this.API_BASE_URL}/auth/vagas/login`, credentials, {
        headers: this.getAuthHeaders()
      });

      if (response.data.success) {
        this.saveConnection('vagas', {
          isConnected: true,
          connectedAt: new Date(),
          credentials: {
            username: credentials.username,
            password: credentials.password,
            accessToken: response.data.accessToken
          }
        });
      }

      return response.data;
    } catch (error) {
      console.error('Erro ao conectar com Vagas.com:', error);
      return {
        success: false,
        message: 'Erro ao conectar com Vagas.com. Verifique suas credenciais.'
      };
    }
  }

  /**
   * Desconecta de uma plataforma
   */
  async disconnectPlatform(platform: string): Promise<AuthResult> {
    try {
      await axios.post(`${this.API_BASE_URL}/auth/${platform}/disconnect`, {}, {
        headers: this.getAuthHeaders()
      });

      this.removeConnection(platform);

      return {
        success: true,
        message: `Desconectado de ${platform} com sucesso`
      };
    } catch (error) {
      console.error(`Erro ao desconectar de ${platform}:`, error);
      return {
        success: false,
        message: `Erro ao desconectar de ${platform}`
      };
    }
  }

  /**
   * Obtém todas as conexões do usuário
   */
  getConnections(): Record<string, PlatformConnection> {
    const connections = localStorage.getItem('platformConnections');
    return connections ? JSON.parse(connections) : {};
  }

  /**
   * Verifica se uma plataforma está conectada
   */
  isConnected(platform: string): boolean {
    const connections = this.getConnections();
    return connections[platform]?.isConnected || false;
  }

  /**
   * Obtém credenciais de uma plataforma
   */
  getCredentials(platform: string): PlatformCredentials | null {
    const connections = this.getConnections();
    return connections[platform]?.credentials || null;
  }

  /**
   * Salva conexão no localStorage
   */
  private saveConnection(platform: string, connection: PlatformConnection): void {
    const connections = this.getConnections();
    connections[platform] = connection;
    localStorage.setItem('platformConnections', JSON.stringify(connections));
  }

  /**
   * Remove conexão do localStorage
   */
  private removeConnection(platform: string): void {
    const connections = this.getConnections();
    delete connections[platform];
    localStorage.setItem('platformConnections', JSON.stringify(connections));
  }

  /**
   * Verifica e renova tokens expirados
   */
  async refreshTokenIfNeeded(platform: string): Promise<boolean> {
    const credentials = this.getCredentials(platform);
    
    if (!credentials?.refreshToken || !credentials?.expiresAt) {
      return false;
    }

    // Verifica se o token expira em menos de 5 minutos
    const fiveMinutesFromNow = new Date(Date.now() + 5 * 60 * 1000);
    if (credentials.expiresAt > fiveMinutesFromNow) {
      return true; // Token ainda válido
    }

    try {
      const response = await axios.post(`${this.API_BASE_URL}/auth/${platform}/refresh`, {
        refreshToken: credentials.refreshToken
      }, {
        headers: this.getAuthHeaders()
      });

      if (response.data.success) {
        const connections = this.getConnections();
        if (connections[platform]) {
          connections[platform].credentials = {
            ...credentials,
            accessToken: response.data.accessToken,
            refreshToken: response.data.refreshToken || credentials.refreshToken,
            expiresAt: response.data.expiresAt ? new Date(response.data.expiresAt) : undefined
          };
          localStorage.setItem('platformConnections', JSON.stringify(connections));
        }
        return true;
      }
    } catch (error) {
      console.error(`Erro ao renovar token de ${platform}:`, error);
    }

    return false;
  }

  /**
   * Testa conexão com uma plataforma
   */
  async testConnection(platform: string): Promise<AuthResult> {
    try {
      const response = await axios.get(`${this.API_BASE_URL}/auth/${platform}/test`, {
        headers: this.getAuthHeaders()
      });

      return response.data;
    } catch (error) {
      console.error(`Erro ao testar conexão com ${platform}:`, error);
      return {
        success: false,
        message: `Erro ao testar conexão com ${platform}`
      };
    }
  }
}

export const platformAuthService = new PlatformAuthService();
