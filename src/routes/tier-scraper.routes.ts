import { Router } from 'express';
import { TierScraperController } from '../controllers/TierScraperController';
import { authMiddleware } from '../middleware/auth';

const router = Router();
const tierScraperController = new TierScraperController();

/**
 * All routes require authentication
 */
router.use(authMiddleware);

/**
 * @route   POST /api/tier-scraper/:platform/search
 * @desc    Search for jobs on a platform
 * @access  Private
 */
router.post('/:platform/search', tierScraperController.searchJobs.bind(tierScraperController));

/**
 * @route   POST /api/tier-scraper/:platform/job/:jobId
 * @desc    Get job details from a platform
 * @access  Private
 */
router.post('/:platform/job/:jobId', tierScraperController.getJobDetails.bind(tierScraperController));

/**
 * @route   GET /api/tier-scraper/usage
 * @desc    Get user usage statistics
 * @access  Private
 */
router.get('/usage', tierScraperController.getUserUsage.bind(tierScraperController));

export default router;
