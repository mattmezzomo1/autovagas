import { Router } from 'express';
import { LinkedInJobsController } from '../controllers/LinkedInJobsController';

const router = Router();
const linkedInJobsController = new LinkedInJobsController();

/**
 * @route   POST /api/jobs/linkedin/search
 * @desc    Busca vagas no LinkedIn
 * @access  Private
 */
router.post('/linkedin/search', linkedInJobsController.searchJobs.bind(linkedInJobsController));

/**
 * @route   POST /api/jobs/linkedin/apply
 * @desc    Aplica para uma vaga no LinkedIn
 * @access  Private
 */
router.post('/linkedin/apply', linkedInJobsController.applyToJob.bind(linkedInJobsController));

export default router;
