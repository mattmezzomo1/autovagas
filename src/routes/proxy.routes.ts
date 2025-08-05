import { Router } from 'express';
import { ProxyController } from '../controllers/ProxyController';
import { authMiddleware } from '../middleware/auth';
import { adminMiddleware } from '../middleware/admin';

const router = Router();
const proxyController = new ProxyController();

/**
 * All routes require authentication and admin privileges
 */
router.use(authMiddleware);
router.use(adminMiddleware);

/**
 * @route   GET /api/proxy/statistics
 * @desc    Get proxy statistics
 * @access  Admin
 */
router.get('/statistics', proxyController.getProxyStatistics.bind(proxyController));

/**
 * @route   POST /api/proxy/refresh
 * @desc    Refresh proxies
 * @access  Admin
 */
router.post('/refresh', proxyController.refreshProxies.bind(proxyController));

/**
 * @route   POST /api/proxy/test
 * @desc    Test proxies
 * @access  Admin
 */
router.post('/test', proxyController.testProxies.bind(proxyController));

/**
 * @route   GET /api/proxy/test-proxy
 * @desc    Get a proxy for testing
 * @access  Admin
 */
router.get('/test-proxy', proxyController.getTestProxy.bind(proxyController));

export default router;
