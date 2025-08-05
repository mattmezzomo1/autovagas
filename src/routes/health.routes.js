const express = require('express');
const router = express.Router();

/**
 * @route GET /api/health
 * @desc Health check endpoint
 * @access Public
 */
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API está funcionando',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

/**
 * @route GET /api/status
 * @desc Status endpoint with more details
 * @access Public
 */
router.get('/status', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Sistema operacional',
    data: {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: process.version,
      platform: process.platform,
      timestamp: new Date().toISOString()
    }
  });
});

module.exports = router;
