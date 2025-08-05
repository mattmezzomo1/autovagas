require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const http = require('http');
const { initializeDatabase } = require('./database');
const redisService = require('./services/redis.service');
const webSocketService = require('./services/websocket.service');

// Create Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Create HTTP server for WebSocket
const server = http.createServer(app);

// Initialize services
async function initializeServices() {
  try {
    console.log('Initializing services...');

    // Initialize database
    await initializeDatabase();
    console.log('Database initialized successfully');

    // Initialize Redis
    await redisService.initialize();
    console.log('Redis initialized successfully');

    // Initialize WebSocket
    webSocketService.initialize(server);
    console.log('WebSocket initialized successfully');

  } catch (error) {
    console.error('Error initializing services:', error);
    // Continue without Redis/WebSocket if they fail
  }
}

  // Middlewares
  app.use(helmet());
  app.use(cors());
  app.use(express.json());

  // Routes
  app.get('/api/health', (req, res) => {
    res.status(200).json({
      status: 'ok',
      message: 'Server is running',
      worker: {
        pid: process.pid,
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage()
      }
    });
  });

// Import routes (only existing ones)
const adminRoutes = require('./api/routes/admin.routes');
const companyRoutes = require('./api/routes/company.routes');
const websocketRoutes = require('./api/routes/websocket.routes');
const cacheManagementRoutes = require('./api/routes/cache-management.routes');
const healthRoutes = require('./routes/health.routes');

// Use routes
app.use('/api/admin', adminRoutes);
app.use('/api/company', companyRoutes);
app.use('/api/websocket', websocketRoutes);
app.use('/api/cache-management', cacheManagementRoutes);
app.use('/api/health', healthRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { error: err.message, stack: err.stack })
  });
});

// Start server
async function startServer() {
  await initializeServices();

  if (process.env.NODE_ENV !== 'test') {
    server.listen(PORT, () => {
      console.log(`Server listening on port ${PORT} with WebSocket support`);
    });
  }
}

// Start the application
startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

module.exports = app;
