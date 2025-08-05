import { Router } from 'express';
import { LinkedInAuthController } from '../controllers/LinkedInAuthController';

const router = Router();
const linkedInAuthController = new LinkedInAuthController();

/**
 * @route   GET /api/auth/linkedin
 * @desc    Inicia o fluxo de autenticação com o LinkedIn
 * @access  Public
 */
router.get('/linkedin', linkedInAuthController.initiateAuth.bind(linkedInAuthController));

/**
 * @route   GET /api/auth/linkedin/callback
 * @desc    Callback para o fluxo de autenticação com o LinkedIn
 * @access  Public
 */
router.get('/linkedin/callback', linkedInAuthController.handleCallback.bind(linkedInAuthController));

/**
 * @route   GET /api/auth/linkedin/check
 * @desc    Verifica se o usuário está autenticado com o LinkedIn
 * @access  Public
 */
router.get('/linkedin/check', linkedInAuthController.checkAuth.bind(linkedInAuthController));

/**
 * @route   POST /api/auth/linkedin/logout
 * @desc    Revoga a autenticação com o LinkedIn
 * @access  Private
 */
router.post('/linkedin/logout', linkedInAuthController.logout.bind(linkedInAuthController));

export default router;
