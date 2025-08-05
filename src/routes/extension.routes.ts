import { Router } from 'express';
import { body, query } from 'express-validator';
import { ExtensionController } from '../controllers/extension.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();
const extensionController = new ExtensionController();

// Middleware de autenticação para todas as rotas da extensão
router.use(authMiddleware);

/**
 * @route   GET /api/extension/validate
 * @desc    Validate extension authentication token
 * @access  Private
 */
router.get('/validate', extensionController.validateToken.bind(extensionController));

/**
 * @route   POST /api/extension/statistics
 * @desc    Receive statistics from Chrome extension
 * @access  Private
 */
router.post('/statistics', [
  body('eventType')
    .isIn(['job_found', 'application_submitted', 'error', 'session_start', 'session_end'])
    .withMessage('Tipo de evento inválido'),
  body('data')
    .isObject()
    .withMessage('Dados devem ser um objeto'),
  body('timestamp')
    .isISO8601()
    .withMessage('Timestamp deve estar no formato ISO8601'),
  body('tabUrl')
    .optional()
    .isURL()
    .withMessage('URL da aba deve ser válida')
], extensionController.receiveStatistics.bind(extensionController));

/**
 * @route   GET /api/extension/settings
 * @desc    Get user settings for extension
 * @access  Private
 */
router.get('/settings', extensionController.getUserSettings.bind(extensionController));

/**
 * @route   POST /api/extension/settings
 * @desc    Save user settings for extension
 * @access  Private
 */
router.post('/settings', [
  body('settings')
    .isObject()
    .withMessage('Configurações devem ser um objeto'),
  body('settings.platforms')
    .isObject()
    .withMessage('Configurações de plataformas devem ser um objeto'),
  body('settings.searchCriteria')
    .isObject()
    .withMessage('Critérios de busca devem ser um objeto'),
  body('settings.applicationSettings')
    .isObject()
    .withMessage('Configurações de aplicação devem ser um objeto')
], extensionController.saveUserSettings.bind(extensionController));

/**
 * @route   GET /api/extension/limits
 * @desc    Get user usage limits
 * @access  Private
 */
router.get('/limits', extensionController.getUserLimits.bind(extensionController));

/**
 * @route   GET /api/extension/can-apply
 * @desc    Check if user can make more applications
 * @access  Private
 */
router.get('/can-apply', extensionController.checkApplicationLimit.bind(extensionController));

/**
 * @route   POST /api/extension/applications
 * @desc    Register a new job application
 * @access  Private
 */
router.post('/applications', [
  body('jobId')
    .notEmpty()
    .withMessage('ID da vaga é obrigatório'),
  body('title')
    .notEmpty()
    .withMessage('Título da vaga é obrigatório'),
  body('company')
    .notEmpty()
    .withMessage('Nome da empresa é obrigatório'),
  body('platform')
    .isIn(['linkedin', 'infojobs', 'catho', 'indeed', 'vagas'])
    .withMessage('Plataforma deve ser uma das suportadas'),
  body('url')
    .isURL()
    .withMessage('URL da vaga deve ser válida')
], extensionController.registerApplication.bind(extensionController));

/**
 * @route   GET /api/extension/applications
 * @desc    Get application history
 * @access  Private
 */
router.get('/applications', [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Página deve ser um número inteiro positivo'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limite deve ser entre 1 e 100'),
  query('platform')
    .optional()
    .isIn(['linkedin', 'infojobs', 'catho', 'indeed', 'vagas'])
    .withMessage('Plataforma deve ser uma das suportadas')
], extensionController.getApplicationHistory.bind(extensionController));

export { router as extensionRoutes };
