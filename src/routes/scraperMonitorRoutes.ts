import { Router } from 'express';
import { ScraperMonitorController } from '../controllers/ScraperMonitorController';

const router = Router();
const scraperMonitorController = new ScraperMonitorController();

/**
 * @route GET /api/scraper-monitor/circuit-breakers
 * @desc Obtém o status dos circuit breakers
 * @access Private (Admin)
 */
router.get('/circuit-breakers', scraperMonitorController.getCircuitBreakersStatus.bind(scraperMonitorController));

/**
 * @route POST /api/scraper-monitor/circuit-breakers/:platform/reset
 * @desc Reseta um circuit breaker específico
 * @access Private (Admin)
 */
router.post('/circuit-breakers/:platform/reset', scraperMonitorController.resetCircuitBreaker.bind(scraperMonitorController));

/**
 * @route GET /api/scraper-monitor/queue
 * @desc Obtém o status das tarefas na fila
 * @access Private (Admin)
 */
router.get('/queue', scraperMonitorController.getQueueStatus.bind(scraperMonitorController));

export default router;
