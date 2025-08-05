import { Router } from 'express';
import { CacheController } from '../controllers/CacheController';
import { authMiddleware } from '../middleware/auth';
import { adminMiddleware } from '../middleware/admin';

const router = Router();
const cacheController = new CacheController();

/**
 * All routes require authentication and admin privileges
 */
router.use(authMiddleware);
router.use(adminMiddleware);

/**
 * @route   GET /api/cache/statistics
 * @desc    Get cache statistics
 * @access  Admin
 */
router.get('/statistics', cacheController.getCacheStatistics.bind(cacheController));

/**
 * @route   POST /api/cache/clear
 * @desc    Clear cache
 * @access  Admin
 */
router.post('/clear', cacheController.clearCache.bind(cacheController));

/**
 * @route   POST /api/cache/policy
 * @desc    Set cache eviction policy
 * @access  Admin
 */
router.post('/policy', cacheController.setCacheEvictionPolicy.bind(cacheController));

/**
 * @route   POST /api/cache/invalidate/:platform
 * @desc    Invalidate cache for a platform
 * @access  Admin
 */
router.post('/invalidate/:platform', cacheController.invalidatePlatformCache.bind(cacheController));

/**
 * @route   POST /api/cache/invalidate/:platform/:operation
 * @desc    Invalidate cache for an operation
 * @access  Admin
 */
router.post('/invalidate/:platform/:operation', cacheController.invalidateOperationCache.bind(cacheController));

export default router;
