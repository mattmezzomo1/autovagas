import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { ExtensionService } from '../services/extension.service';
import { AuthService } from '../services/auth.service';
import { logger } from '../utils/logger';

export class ExtensionController {
  private extensionService: ExtensionService;
  private authService: AuthService;

  constructor() {
    this.extensionService = new ExtensionService();
    this.authService = new AuthService();
  }

  // Valida o token de autenticação da extensão
  async validateToken(req: Request, res: Response) {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
          success: false,
          message: 'Token de autorização não fornecido'
        });
      }

      const token = authHeader.substring(7);
      const decoded = await this.authService.verifyToken(token);

      if (!decoded) {
        return res.status(401).json({
          success: false,
          message: 'Token inválido'
        });
      }

      // Verifica se o usuário tem plano básico (necessário para extensão)
      const user = await this.authService.getUserById(decoded.userId);
      
      if (!user || user.subscription?.plan !== 'basic') {
        return res.status(403).json({
          success: false,
          message: 'Acesso negado. Plano básico necessário para usar a extensão.'
        });
      }

      res.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          subscription: user.subscription
        }
      });

    } catch (error) {
      logger.error('Error validating extension token:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  // Recebe estatísticas da extensão
  async receiveStatistics(req: Request, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors: errors.array()
        });
      }

      const { eventType, data, tabUrl, timestamp } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Usuário não autenticado'
        });
      }

      // Salva as estatísticas
      await this.extensionService.saveStatistics({
        userId,
        eventType,
        data,
        tabUrl,
        timestamp: new Date(timestamp),
        platform: this.extractPlatformFromUrl(tabUrl)
      });

      // Se for uma aplicação submetida, atualiza os limites do usuário
      if (eventType === 'application_submitted') {
        await this.extensionService.updateUserLimits(userId);
      }

      res.json({
        success: true,
        message: 'Estatísticas recebidas com sucesso'
      });

    } catch (error) {
      logger.error('Error receiving extension statistics:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  // Obtém configurações do usuário para a extensão
  async getUserSettings(req: Request, res: Response) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Usuário não autenticado'
        });
      }

      const settings = await this.extensionService.getUserSettings(userId);

      res.json({
        success: true,
        settings
      });

    } catch (error) {
      logger.error('Error getting user settings:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  // Salva configurações do usuário da extensão
  async saveUserSettings(req: Request, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors: errors.array()
        });
      }

      const userId = req.user?.id;
      const { settings } = req.body;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Usuário não autenticado'
        });
      }

      await this.extensionService.saveUserSettings(userId, settings);

      res.json({
        success: true,
        message: 'Configurações salvas com sucesso'
      });

    } catch (error) {
      logger.error('Error saving user settings:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  // Obtém limites de uso do usuário
  async getUserLimits(req: Request, res: Response) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Usuário não autenticado'
        });
      }

      const limits = await this.extensionService.getUserLimits(userId);

      res.json({
        success: true,
        limits
      });

    } catch (error) {
      logger.error('Error getting user limits:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  // Obtém estatísticas do usuário
  async getUserStatistics(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { startDate, endDate, platform } = req.query;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Usuário não autenticado'
        });
      }

      const statistics = await this.extensionService.getUserStatistics(userId, {
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        platform: platform as string
      });

      res.json({
        success: true,
        statistics
      });

    } catch (error) {
      logger.error('Error getting user statistics:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  // Verifica se o usuário pode fazer mais aplicações
  async checkApplicationLimit(req: Request, res: Response) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Usuário não autenticado'
        });
      }

      const canApply = await this.extensionService.canUserApply(userId);
      const limits = await this.extensionService.getUserLimits(userId);

      res.json({
        success: true,
        canApply,
        limits
      });

    } catch (error) {
      logger.error('Error checking application limit:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  // Registra uma nova aplicação
  async registerApplication(req: Request, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors: errors.array()
        });
      }

      const userId = req.user?.id;
      const applicationData = req.body;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Usuário não autenticado'
        });
      }

      // Verifica se o usuário pode aplicar
      const canApply = await this.extensionService.canUserApply(userId);
      if (!canApply) {
        return res.status(429).json({
          success: false,
          message: 'Limite de aplicações mensais atingido'
        });
      }

      // Registra a aplicação
      const application = await this.extensionService.registerApplication(userId, applicationData);

      res.json({
        success: true,
        application,
        message: 'Aplicação registrada com sucesso'
      });

    } catch (error) {
      logger.error('Error registering application:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  // Obtém histórico de aplicações
  async getApplicationHistory(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { page = 1, limit = 20, platform, status } = req.query;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Usuário não autenticado'
        });
      }

      const history = await this.extensionService.getApplicationHistory(userId, {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        platform: platform as string,
        status: status as string
      });

      res.json({
        success: true,
        history
      });

    } catch (error) {
      logger.error('Error getting application history:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  // Método auxiliar para extrair plataforma da URL
  private extractPlatformFromUrl(url: string): string {
    if (!url) return 'unknown';
    
    if (url.includes('linkedin.com')) return 'linkedin';
    if (url.includes('infojobs.com.br')) return 'infojobs';
    if (url.includes('catho.com.br')) return 'catho';
    if (url.includes('indeed.com')) return 'indeed';
    if (url.includes('vagas.com.br')) return 'vagas';
    
    return 'unknown';
  }
}
