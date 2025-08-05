import { Request, Response } from 'express';
import { LinkedInAuthService } from '../services/auth/LinkedInAuthService';
import { TokenStorage } from '../services/auth/TokenStorage';

/**
 * Controlador para autenticação com o LinkedIn
 */
export class LinkedInAuthController {
  private authService: LinkedInAuthService;
  
  constructor() {
    this.authService = new LinkedInAuthService();
  }
  
  /**
   * Inicia o fluxo de autenticação com o LinkedIn
   */
  async initiateAuth(req: Request, res: Response): Promise<void> {
    try {
      const authUrl = this.authService.getAuthorizationUrl();
      res.redirect(authUrl);
    } catch (error) {
      console.error('Error initiating LinkedIn auth:', error);
      res.status(500).json({ error: 'Failed to initiate LinkedIn authentication' });
    }
  }
  
  /**
   * Callback para o fluxo de autenticação com o LinkedIn
   */
  async handleCallback(req: Request, res: Response): Promise<void> {
    try {
      const { code, state } = req.query;
      
      if (!code || !state) {
        throw new Error('Missing code or state parameter');
      }
      
      const tokens = await this.authService.exchangeCodeForToken(code.toString(), state.toString());
      
      // Armazena os tokens para o usuário
      // Em uma aplicação real, você obteria o ID do usuário da sessão
      const userId = req.session?.userId || 'default-user';
      TokenStorage.storeTokens(userId, 'linkedin', tokens);
      
      // Redireciona para a página de sucesso
      res.redirect('/auth/linkedin/success');
    } catch (error) {
      console.error('Error handling LinkedIn callback:', error);
      res.status(500).json({ error: 'Failed to complete LinkedIn authentication' });
    }
  }
  
  /**
   * Verifica se o usuário está autenticado com o LinkedIn
   */
  async checkAuth(req: Request, res: Response): Promise<void> {
    try {
      // Em uma aplicação real, você obteria o ID do usuário da sessão
      const userId = req.session?.userId || 'default-user';
      
      const isAuthenticated = !TokenStorage.areTokensExpired(userId, 'linkedin');
      
      res.json({ authenticated: isAuthenticated });
    } catch (error) {
      console.error('Error checking LinkedIn auth:', error);
      res.status(500).json({ error: 'Failed to check LinkedIn authentication' });
    }
  }
  
  /**
   * Revoga a autenticação com o LinkedIn
   */
  async logout(req: Request, res: Response): Promise<void> {
    try {
      // Em uma aplicação real, você obteria o ID do usuário da sessão
      const userId = req.session?.userId || 'default-user';
      
      TokenStorage.removeTokens(userId, 'linkedin');
      
      res.json({ success: true });
    } catch (error) {
      console.error('Error logging out from LinkedIn:', error);
      res.status(500).json({ error: 'Failed to logout from LinkedIn' });
    }
  }
}
