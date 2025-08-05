import { Request, Response } from 'express';
import { ScraperQueueService } from '../services/queue/ScraperQueueService';

/**
 * Controlador para monitoramento e gerenciamento dos scrapers
 */
export class ScraperMonitorController {
  private scraperQueueService: ScraperQueueService;
  
  constructor() {
    this.scraperQueueService = new ScraperQueueService();
  }
  
  /**
   * Obtém o status dos circuit breakers
   */
  getCircuitBreakersStatus(req: Request, res: Response): void {
    try {
      const status = this.scraperQueueService.getCircuitBreakersStatus();
      res.json({
        success: true,
        data: status
      });
    } catch (error) {
      console.error('Erro ao obter status dos circuit breakers:', error);
      res.status(500).json({
        success: false,
        error: 'Falha ao obter status dos circuit breakers'
      });
    }
  }
  
  /**
   * Reseta um circuit breaker específico
   */
  resetCircuitBreaker(req: Request, res: Response): void {
    try {
      const { platform } = req.params;
      
      if (!platform) {
        res.status(400).json({
          success: false,
          error: 'Plataforma não especificada'
        });
        return;
      }
      
      const result = this.scraperQueueService.resetCircuitBreaker(platform);
      
      if (result) {
        res.json({
          success: true,
          message: `Circuit breaker para ${platform} resetado com sucesso`
        });
      } else {
        res.status(404).json({
          success: false,
          error: `Plataforma ${platform} não encontrada`
        });
      }
    } catch (error) {
      console.error('Erro ao resetar circuit breaker:', error);
      res.status(500).json({
        success: false,
        error: 'Falha ao resetar circuit breaker'
      });
    }
  }
  
  /**
   * Obtém o status das tarefas na fila
   */
  getQueueStatus(req: Request, res: Response): void {
    try {
      // Implementar método para obter status da fila
      res.json({
        success: true,
        data: {
          message: 'Funcionalidade a ser implementada'
        }
      });
    } catch (error) {
      console.error('Erro ao obter status da fila:', error);
      res.status(500).json({
        success: false,
        error: 'Falha ao obter status da fila'
      });
    }
  }
}
