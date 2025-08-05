import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import axios from 'axios';
import * as crypto from 'crypto';
import { PlatformConnection } from '../entities/platform-connection.entity';
import { LoginCredentialsDto } from '../auth/dto/login-credentials.dto';

interface AuthResult {
  success: boolean;
  message: string;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: Date;
  email?: string;
}

@Injectable()
export class PlatformAuthService {
  private readonly logger = new Logger(PlatformAuthService.name);

  constructor(
    @InjectRepository(PlatformConnection)
    private platformConnectionRepository: Repository<PlatformConnection>,
    private configService: ConfigService,
  ) {}

  // ===== LINKEDIN OAUTH =====

  async getLinkedInAuthUrl(userId: string): Promise<{ authUrl: string; state: string }> {
    const clientId = this.configService.get<string>('LINKEDIN_CLIENT_ID');
    const redirectUri = this.configService.get<string>('LINKEDIN_REDIRECT_URI');
    
    if (!clientId || !redirectUri) {
      throw new Error('LinkedIn OAuth not configured');
    }

    const state = crypto.randomBytes(32).toString('hex');
    
    // Salvar state temporariamente (em produção, use Redis)
    await this.saveTemporaryState(userId, 'linkedin', state);

    const authUrl = `https://www.linkedin.com/oauth/v2/authorization?` +
      `response_type=code&` +
      `client_id=${clientId}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `state=${state}&` +
      `scope=r_liteprofile%20r_emailaddress`;

    return { authUrl, state };
  }

  async handleLinkedInCallback(code: string, state: string): Promise<AuthResult> {
    try {
      // Verificar state
      const userId = await this.verifyState('linkedin', state);
      if (!userId) {
        throw new UnauthorizedException('Invalid state parameter');
      }

      // Trocar código por token
      const tokenResponse = await this.exchangeLinkedInCode(code);
      
      if (!tokenResponse.access_token) {
        throw new Error('Failed to get access token');
      }

      // Obter informações do usuário
      const userInfo = await this.getLinkedInUserInfo(tokenResponse.access_token);

      // Salvar conexão
      await this.saveConnection(userId, 'linkedin', {
        accessToken: tokenResponse.access_token,
        refreshToken: tokenResponse.refresh_token,
        expiresAt: new Date(Date.now() + tokenResponse.expires_in * 1000),
        email: userInfo.email,
        username: userInfo.email,
      });

      return {
        success: true,
        message: 'Conectado com LinkedIn com sucesso',
        accessToken: tokenResponse.access_token,
        refreshToken: tokenResponse.refresh_token,
        expiresAt: new Date(Date.now() + tokenResponse.expires_in * 1000),
        email: userInfo.email,
      };
    } catch (error) {
      this.logger.error('LinkedIn callback error:', error);
      return {
        success: false,
        message: 'Erro ao conectar com LinkedIn',
      };
    }
  }

  private async exchangeLinkedInCode(code: string) {
    const clientId = this.configService.get<string>('LINKEDIN_CLIENT_ID');
    const clientSecret = this.configService.get<string>('LINKEDIN_CLIENT_SECRET');
    const redirectUri = this.configService.get<string>('LINKEDIN_REDIRECT_URI');

    const response = await axios.post('https://www.linkedin.com/oauth/v2/accessToken', {
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
      client_id: clientId,
      client_secret: clientSecret,
    }, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    return response.data;
  }

  private async getLinkedInUserInfo(accessToken: string) {
    const response = await axios.get('https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))', {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });

    return {
      email: response.data.elements[0]['handle~'].emailAddress
    };
  }

  // ===== CREDENTIAL-BASED PLATFORMS =====

  async loginInfoJobs(userId: string, credentials: LoginCredentialsDto): Promise<AuthResult> {
    try {
      // Simular login no InfoJobs (implementar scraping real)
      const loginResult = await this.simulateLogin('infojobs', credentials);
      
      if (loginResult.success) {
        await this.saveConnection(userId, 'infojobs', {
          username: credentials.username,
          password: this.encryptPassword(credentials.password),
          accessToken: loginResult.sessionToken,
        });
      }

      return loginResult;
    } catch (error) {
      this.logger.error('InfoJobs login error:', error);
      return {
        success: false,
        message: 'Erro ao conectar com InfoJobs',
      };
    }
  }

  async loginCatho(userId: string, credentials: LoginCredentialsDto): Promise<AuthResult> {
    try {
      const loginResult = await this.simulateLogin('catho', credentials);
      
      if (loginResult.success) {
        await this.saveConnection(userId, 'catho', {
          username: credentials.username,
          password: this.encryptPassword(credentials.password),
          accessToken: loginResult.sessionToken,
        });
      }

      return loginResult;
    } catch (error) {
      this.logger.error('Catho login error:', error);
      return {
        success: false,
        message: 'Erro ao conectar com Catho',
      };
    }
  }

  async loginIndeed(userId: string, credentials: LoginCredentialsDto): Promise<AuthResult> {
    try {
      const loginResult = await this.simulateLogin('indeed', credentials);
      
      if (loginResult.success) {
        await this.saveConnection(userId, 'indeed', {
          username: credentials.username,
          password: this.encryptPassword(credentials.password),
          accessToken: loginResult.sessionToken,
        });
      }

      return loginResult;
    } catch (error) {
      this.logger.error('Indeed login error:', error);
      return {
        success: false,
        message: 'Erro ao conectar com Indeed',
      };
    }
  }

  async loginVagas(userId: string, credentials: LoginCredentialsDto): Promise<AuthResult> {
    try {
      const loginResult = await this.simulateLogin('vagas', credentials);
      
      if (loginResult.success) {
        await this.saveConnection(userId, 'vagas', {
          username: credentials.username,
          password: this.encryptPassword(credentials.password),
          accessToken: loginResult.sessionToken,
        });
      }

      return loginResult;
    } catch (error) {
      this.logger.error('Vagas.com login error:', error);
      return {
        success: false,
        message: 'Erro ao conectar com Vagas.com',
      };
    }
  }

  // ===== UTILITY METHODS =====

  async getUserConnections(userId: string) {
    const connections = await this.platformConnectionRepository.find({
      where: { userId },
      select: ['platform', 'isActive', 'connectedAt', 'lastUsed'],
    });

    return {
      success: true,
      data: connections.reduce((acc, conn) => {
        acc[conn.platform] = {
          isConnected: conn.isActive,
          connectedAt: conn.connectedAt,
          lastUsed: conn.lastUsed,
        };
        return acc;
      }, {}),
    };
  }

  async testConnection(userId: string, platform: string): Promise<AuthResult> {
    try {
      const connection = await this.platformConnectionRepository.findOne({
        where: { userId, platform, isActive: true },
      });

      if (!connection) {
        return {
          success: false,
          message: `Não conectado com ${platform}`,
        };
      }

      // Testar se as credenciais ainda são válidas
      const isValid = await this.validateConnection(connection);

      return {
        success: isValid,
        message: isValid ? 'Conexão válida' : 'Conexão expirada ou inválida',
      };
    } catch (error) {
      this.logger.error(`Test connection error for ${platform}:`, error);
      return {
        success: false,
        message: 'Erro ao testar conexão',
      };
    }
  }

  async disconnectPlatform(userId: string, platform: string): Promise<AuthResult> {
    try {
      await this.platformConnectionRepository.update(
        { userId, platform },
        { isActive: false, disconnectedAt: new Date() }
      );

      return {
        success: true,
        message: `Desconectado de ${platform} com sucesso`,
      };
    } catch (error) {
      this.logger.error(`Disconnect error for ${platform}:`, error);
      return {
        success: false,
        message: `Erro ao desconectar de ${platform}`,
      };
    }
  }

  async refreshToken(userId: string, platform: string, refreshToken: string): Promise<AuthResult> {
    // Implementar refresh de token específico para cada plataforma
    return {
      success: false,
      message: 'Refresh token não implementado para esta plataforma',
    };
  }

  // ===== PRIVATE METHODS =====

  private async simulateLogin(platform: string, credentials: LoginCredentialsDto): Promise<AuthResult & { sessionToken?: string }> {
    // Simular login (em produção, implementar scraping real)
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Simular sucesso/falha baseado em credenciais
    const isValid = credentials.username.includes('@') && credentials.password.length >= 6;

    if (isValid) {
      return {
        success: true,
        message: `Conectado com ${platform} com sucesso`,
        sessionToken: crypto.randomBytes(32).toString('hex'),
      };
    } else {
      return {
        success: false,
        message: 'Credenciais inválidas',
      };
    }
  }

  private async saveConnection(userId: string, platform: string, credentials: any) {
    const connection = await this.platformConnectionRepository.findOne({
      where: { userId, platform },
    });

    if (connection) {
      // Atualizar conexão existente
      connection.credentials = credentials;
      connection.isActive = true;
      connection.connectedAt = new Date();
      await this.platformConnectionRepository.save(connection);
    } else {
      // Criar nova conexão
      const newConnection = this.platformConnectionRepository.create({
        userId,
        platform,
        credentials,
        isActive: true,
        connectedAt: new Date(),
      });
      await this.platformConnectionRepository.save(newConnection);
    }
  }

  private async saveTemporaryState(userId: string, platform: string, state: string) {
    // Em produção, usar Redis para armazenar states temporários
    // Por enquanto, salvar no banco com TTL
    const tempConnection = this.platformConnectionRepository.create({
      userId,
      platform: `${platform}_temp`,
      credentials: { state },
      isActive: false,
      connectedAt: new Date(),
    });
    await this.platformConnectionRepository.save(tempConnection);
  }

  private async verifyState(platform: string, state: string): Promise<string | null> {
    const tempConnection = await this.platformConnectionRepository.findOne({
      where: { 
        platform: `${platform}_temp`,
        credentials: { state } as any,
      },
    });

    if (tempConnection) {
      // Remover state temporário
      await this.platformConnectionRepository.remove(tempConnection);
      return tempConnection.userId;
    }

    return null;
  }

  private async validateConnection(connection: PlatformConnection): Promise<boolean> {
    // Implementar validação específica para cada plataforma
    return connection.isActive;
  }

  private encryptPassword(password: string): string {
    // Implementar criptografia real em produção
    return Buffer.from(password).toString('base64');
  }

  private decryptPassword(encryptedPassword: string): string {
    // Implementar descriptografia real em produção
    return Buffer.from(encryptedPassword, 'base64').toString();
  }
}
