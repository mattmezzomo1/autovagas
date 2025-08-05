import { Request, Response } from 'express';
import { ScraperQueueService } from '../services/queue/ScraperQueueService';
import { JobSearchParams } from '../services/webscraper/types';

/**
 * Controlador para gerenciar requisições de scraping
 */
export class ScraperController {
  private queueService: ScraperQueueService;
  
  constructor() {
    this.queueService = new ScraperQueueService();
  }
  
  /**
   * Busca vagas em uma plataforma específica
   */
  async searchJobs(req: Request, res: Response): Promise<void> {
    try {
      const { platform } = req.params;
      const params: JobSearchParams = req.body;
      
      // Valida a plataforma
      if (!['linkedin', 'infojobs', 'catho', 'indeed'].includes(platform)) {
        res.status(400).json({ error: 'Plataforma inválida' });
        return;
      }
      
      // Adiciona a tarefa à fila
      const taskId = await this.queueService.enqueueJobSearch(platform, params);
      
      res.json({ 
        message: 'Busca de vagas adicionada à fila',
        taskId
      });
    } catch (error) {
      console.error('Erro ao buscar vagas:', error);
      res.status(500).json({ error: 'Erro ao buscar vagas' });
    }
  }
  
  /**
   * Aplica para uma vaga
   */
  async applyToJob(req: Request, res: Response): Promise<void> {
    try {
      const { platform } = req.params;
      const { job, profile } = req.body;
      
      // Valida a plataforma
      if (!['linkedin', 'infojobs', 'catho', 'indeed'].includes(platform)) {
        res.status(400).json({ error: 'Plataforma inválida' });
        return;
      }
      
      // Adiciona a tarefa à fila
      const taskId = await this.queueService.enqueueJobApplication(platform, job, profile);
      
      res.json({ 
        message: 'Aplicação para vaga adicionada à fila',
        taskId
      });
    } catch (error) {
      console.error('Erro ao aplicar para vaga:', error);
      res.status(500).json({ error: 'Erro ao aplicar para vaga' });
    }
  }
  
  /**
   * Verifica o status de uma tarefa
   */
  async checkTaskStatus(req: Request, res: Response): Promise<void> {
    try {
      const { taskId } = req.params;
      
      const task = this.queueService.getTaskStatus(taskId);
      
      if (!task) {
        res.status(404).json({ error: 'Tarefa não encontrada' });
        return;
      }
      
      res.json({
        id: task.id,
        platform: task.platform,
        type: task.type,
        status: task.status,
        createdAt: task.createdAt,
        attempts: task.attempts,
        result: task.result,
        error: task.error
      });
    } catch (error) {
      console.error('Erro ao verificar status da tarefa:', error);
      res.status(500).json({ error: 'Erro ao verificar status da tarefa' });
    }
  }
}
