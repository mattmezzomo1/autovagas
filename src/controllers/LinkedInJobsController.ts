import { Request, Response } from 'express';
import { LinkedInApiService } from '../services/api/LinkedInApiService';
import { LinkedInScraperService } from '../services/webscraper/LinkedInScraperService';
import { JobSearchParams } from '../services/webscraper/types';

/**
 * Controlador para busca e aplicação em vagas do LinkedIn
 */
export class LinkedInJobsController {
  private apiService: LinkedInApiService | null = null;
  private scraperService: LinkedInScraperService;
  
  constructor() {
    this.scraperService = new LinkedInScraperService();
  }
  
  /**
   * Busca vagas no LinkedIn
   */
  async searchJobs(req: Request, res: Response): Promise<void> {
    try {
      // Em uma aplicação real, você obteria o ID do usuário da sessão
      const userId = req.session?.userId || 'default-user';
      
      // Obtém os parâmetros de busca do corpo da requisição
      const params: JobSearchParams = req.body;
      
      // Tenta usar a API oficial primeiro
      try {
        this.apiService = new LinkedInApiService(userId);
        const jobs = await this.apiService.searchJobs(params);
        res.json(jobs);
        return;
      } catch (apiError) {
        console.error('Error using LinkedIn API, falling back to scraper:', apiError);
      }
      
      // Fallback para o scraper
      // Obtém as credenciais do usuário (em uma aplicação real, isso viria de um banco de dados)
      const credentials = {
        username: process.env.LINKEDIN_TEST_USERNAME || '',
        password: process.env.LINKEDIN_TEST_PASSWORD || ''
      };
      
      // Inicializa o scraper se necessário
      if (!this.scraperService.isInitialized()) {
        await this.scraperService.initialize();
      }
      
      // Faz login se necessário
      if (!this.scraperService.isLoggedIn('linkedin')) {
        await this.scraperService.login(credentials);
      }
      
      // Busca as vagas
      const jobs = await this.scraperService.searchJobs(params);
      
      res.json(jobs);
    } catch (error) {
      console.error('Error searching LinkedIn jobs:', error);
      res.status(500).json({ error: 'Failed to search LinkedIn jobs' });
    }
  }
  
  /**
   * Aplica para uma vaga no LinkedIn
   */
  async applyToJob(req: Request, res: Response): Promise<void> {
    try {
      // Em uma aplicação real, você obteria o ID do usuário da sessão
      const userId = req.session?.userId || 'default-user';
      
      // Obtém os dados da vaga e do perfil do usuário
      const { jobId, applicationData } = req.body;
      
      // Tenta usar a API oficial primeiro
      try {
        this.apiService = new LinkedInApiService(userId);
        const result = await this.apiService.applyToJob(jobId, applicationData);
        res.json(result);
        return;
      } catch (apiError) {
        console.error('Error using LinkedIn API, falling back to scraper:', apiError);
      }
      
      // Fallback para o scraper
      // Obtém as credenciais do usuário (em uma aplicação real, isso viria de um banco de dados)
      const credentials = {
        username: process.env.LINKEDIN_TEST_USERNAME || '',
        password: process.env.LINKEDIN_TEST_PASSWORD || ''
      };
      
      // Inicializa o scraper se necessário
      if (!this.scraperService.isInitialized()) {
        await this.scraperService.initialize();
      }
      
      // Faz login se necessário
      if (!this.scraperService.isLoggedIn('linkedin')) {
        await this.scraperService.login(credentials);
      }
      
      // Aplica para a vaga
      const result = await this.scraperService.applyToJob(req.body.job, req.body.profile);
      
      res.json(result);
    } catch (error) {
      console.error('Error applying to LinkedIn job:', error);
      res.status(500).json({ error: 'Failed to apply to LinkedIn job' });
    }
  }
}
