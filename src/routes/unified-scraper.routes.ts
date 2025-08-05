import { Router } from 'express';
import { UnifiedScraperController } from '../controllers/UnifiedScraperController';
import { authMiddleware } from '../middleware/auth';
import { rateLimitMiddleware } from '../middleware/rateLimit';

const router = Router();
const unifiedScraperController = new UnifiedScraperController();

/**
 * All routes require authentication
 */
router.use(authMiddleware);

/**
 * Apply rate limiting to all routes
 */
router.use(rateLimitMiddleware);

/**
 * @route   POST /api/scraper/:platform/search
 * @desc    Search for jobs on a platform
 * @access  Private
 */
router.post('/:platform/search', unifiedScraperController.searchJobs.bind(unifiedScraperController));

/**
 * @route   POST /api/scraper/:platform/job/:jobId
 * @desc    Get job details from a platform
 * @access  Private
 */
router.post('/:platform/job/:jobId', unifiedScraperController.getJobDetails.bind(unifiedScraperController));

/**
 * @route   GET /api/scraper/task/:taskId
 * @desc    Check task status
 * @access  Private
 */
router.get('/task/:taskId', unifiedScraperController.checkTaskStatus.bind(unifiedScraperController));

/**
 * @route   GET /api/scraper/usage
 * @desc    Get user usage statistics
 * @access  Private
 */
router.get('/usage', unifiedScraperController.getUserUsage.bind(unifiedScraperController));

export default router;
