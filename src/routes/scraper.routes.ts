import { Router } from 'express';
import { ScraperController } from '../controllers/ScraperController';

const router = Router();
const scraperController = new ScraperController();

/**
 * @route   POST /api/scraper/:platform/search
 * @desc    Busca vagas em uma plataforma específica
 * @access  Private
 */
router.post('/:platform/search', scraperController.searchJobs.bind(scraperController));

/**
 * @route   POST /api/scraper/:platform/apply
 * @desc    Aplica para uma vaga em uma plataforma específica
 * @access  Private
 */
router.post('/:platform/apply', scraperController.applyToJob.bind(scraperController));

/**
 * @route   GET /api/scraper/task/:taskId
 * @desc    Verifica o status de uma tarefa
 * @access  Private
 */
router.get('/task/:taskId', scraperController.checkTaskStatus.bind(scraperController));

export default router;
