import { Router } from 'express';
import { ExtensionDashboardController } from '../controllers/ExtensionDashboardController';
import { authMiddleware } from '../middleware/auth';
import { adminMiddleware } from '../middleware/admin';

const router = Router();
const dashboardController = new ExtensionDashboardController();

/**
 * All routes require authentication and admin privileges
 */
router.use(authMiddleware);
router.use(adminMiddleware);

/**
 * @route   GET /api/extension-dashboard/overview
 * @desc    Get dashboard overview data
 * @access  Admin
 */
router.get('/overview', dashboardController.getDashboardOverview.bind(dashboardController));

/**
 * @route   GET /api/extension-dashboard/extensions
 * @desc    Get active extensions
 * @access  Admin
 */
router.get('/extensions', dashboardController.getActiveExtensions.bind(dashboardController));

/**
 * @route   GET /api/extension-dashboard/tasks
 * @desc    Get task queue
 * @access  Admin
 */
router.get('/tasks', dashboardController.getTaskQueue.bind(dashboardController));

/**
 * @route   GET /api/extension-dashboard/history
 * @desc    Get task history
 * @access  Admin
 */
router.get('/history', dashboardController.getTaskHistory.bind(dashboardController));

/**
 * @route   GET /api/extension-dashboard/performance
 * @desc    Get performance metrics
 * @access  Admin
 */
router.get('/performance', dashboardController.getPerformanceMetrics.bind(dashboardController));

/**
 * @route   GET /api/extension-dashboard/platforms
 * @desc    Get platform statistics
 * @access  Admin
 */
router.get('/platforms', dashboardController.getPlatformStatistics.bind(dashboardController));

export default router;
