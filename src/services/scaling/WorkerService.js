/**
 * Service for worker process management
 */
class WorkerService {
  constructor() {
    this.health = {
      status: 'healthy',
      lastUpdate: new Date(),
      memoryUsage: process.memoryUsage(),
      uptime: process.uptime()
    };
    
    this.metrics = {
      requestsHandled: 0,
      errorsCount: 0,
      averageResponseTime: 0,
      lastRequestTime: null
    };
    
    // Set up health monitoring
    setInterval(() => this.updateHealth(), 10000);
    
    // Listen for messages from master
    process.on('message', (message) => {
      this.handleMasterMessage(message);
    });
  }
  
  /**
   * Initialize the worker
   */
  initialize() {
    console.log(`Worker ${process.pid} initialized`);
    
    // Send initial health status
    this.sendHealthStatus();
    
    // Set up graceful shutdown
    process.on('SIGTERM', () => {
      console.log(`Worker ${process.pid} received SIGTERM, shutting down gracefully`);
      this.gracefulShutdown();
    });
    
    process.on('SIGINT', () => {
      console.log(`Worker ${process.pid} received SIGINT, shutting down gracefully`);
      this.gracefulShutdown();
    });
  }
  
  /**
   * Handle messages from master process
   */
  handleMasterMessage(message) {
    switch (message.type) {
      case 'health_check':
        this.sendHealthStatus();
        break;
      case 'shutdown':
        this.gracefulShutdown();
        break;
      default:
        console.log(`Worker ${process.pid} received unknown message:`, message);
    }
  }
  
  /**
   * Update health status
   */
  updateHealth() {
    this.health = {
      status: 'healthy',
      lastUpdate: new Date(),
      memoryUsage: process.memoryUsage(),
      uptime: process.uptime(),
      pid: process.pid
    };
    
    // Send health status to master
    this.sendHealthStatus();
  }
  
  /**
   * Send health status to master
   */
  sendHealthStatus() {
    if (process.send) {
      process.send({
        type: 'health',
        data: this.health
      });
    }
  }
  
  /**
   * Send metrics to master
   */
  sendMetrics() {
    if (process.send) {
      process.send({
        type: 'metrics',
        data: this.metrics
      });
    }
  }
  
  /**
   * Record a request
   */
  recordRequest(responseTime) {
    this.metrics.requestsHandled++;
    this.metrics.lastRequestTime = new Date();
    
    // Update average response time
    if (this.metrics.averageResponseTime === 0) {
      this.metrics.averageResponseTime = responseTime;
    } else {
      this.metrics.averageResponseTime = 
        (this.metrics.averageResponseTime + responseTime) / 2;
    }
    
    // Send metrics every 100 requests
    if (this.metrics.requestsHandled % 100 === 0) {
      this.sendMetrics();
    }
  }
  
  /**
   * Record an error
   */
  recordError() {
    this.metrics.errorsCount++;
  }
  
  /**
   * Get worker status
   */
  getStatus() {
    return {
      health: this.health,
      metrics: this.metrics,
      pid: process.pid
    };
  }
  
  /**
   * Graceful shutdown
   */
  gracefulShutdown() {
    console.log(`Worker ${process.pid} starting graceful shutdown`);
    
    // Update health status
    this.health.status = 'shutting_down';
    this.sendHealthStatus();
    
    // Give time for ongoing requests to complete
    setTimeout(() => {
      console.log(`Worker ${process.pid} shutdown complete`);
      process.exit(0);
    }, 5000);
  }
  
  /**
   * Middleware to track requests
   */
  trackingMiddleware() {
    return (req, res, next) => {
      const startTime = Date.now();
      
      // Override res.end to capture response time
      const originalEnd = res.end;
      res.end = (...args) => {
        const responseTime = Date.now() - startTime;
        this.recordRequest(responseTime);
        
        // Call original end method
        originalEnd.apply(res, args);
      };
      
      // Track errors
      res.on('error', () => {
        this.recordError();
      });
      
      next();
    };
  }
}

module.exports = WorkerService;
