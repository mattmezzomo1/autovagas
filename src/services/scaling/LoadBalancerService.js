const os = require('os');
const cluster = require('cluster');

/**
 * Service for load balancing across multiple CPU cores
 */
class LoadBalancerService {
  constructor() {
    this.numCPUs = os.cpus().length;
    this.maxWorkers = process.env.MAX_WORKERS || this.numCPUs;
    this.workers = new Map();
    
    // Ensure maxWorkers is not greater than available CPUs
    this.maxWorkers = Math.min(this.maxWorkers, this.numCPUs);
    
    console.log(`System has ${this.numCPUs} CPUs, using ${this.maxWorkers} workers`);
  }
  
  /**
   * Initialize the load balancer
   */
  initialize() {
    if (cluster.isPrimary) {
      console.log(`Master process ${process.pid} is running`);
      
      // Fork workers
      for (let i = 0; i < this.maxWorkers; i++) {
        this.createWorker();
      }
      
      // Handle worker exit
      cluster.on('exit', (worker, code, signal) => {
        console.log(`Worker ${worker.process.pid} died with code: ${code} and signal: ${signal}`);
        this.workers.delete(worker.id);
        
        // Replace the dead worker
        this.createWorker();
      });
      
      // Set up periodic health check
      setInterval(() => this.checkWorkerHealth(), 30000);
    } else {
      console.log(`Worker ${process.pid} started`);
    }
  }
  
  /**
   * Create a new worker
   */
  createWorker() {
    const worker = cluster.fork();
    this.workers.set(worker.id, worker);
    
    console.log(`Worker ${worker.process.pid} started`);
    
    // Set up message handling
    worker.on('message', (message) => {
      this.handleWorkerMessage(worker, message);
    });
    
    return worker;
  }
  
  /**
   * Handle messages from workers
   */
  handleWorkerMessage(worker, message) {
    if (message.type === 'health') {
      // Update worker health status
      worker.health = message.data;
    } else if (message.type === 'metrics') {
      // Update worker metrics
      worker.metrics = message.data;
    }
  }
  
  /**
   * Check health of all workers
   */
  checkWorkerHealth() {
    console.log('Checking worker health...');
    
    for (const [id, worker] of this.workers.entries()) {
      // Request health status from worker
      worker.send({ type: 'health_check' });
      
      // Check if worker is responsive
      if (worker.health && worker.health.lastUpdate) {
        const lastUpdate = new Date(worker.health.lastUpdate);
        const now = new Date();
        
        // If worker hasn't updated health in 2 minutes, kill it
        if (now.getTime() - lastUpdate.getTime() > 120000) {
          console.log(`Worker ${worker.process.pid} is unresponsive, killing it`);
          worker.kill();
        }
      }
    }
  }
  
  /**
   * Get system metrics
   */
  getSystemMetrics() {
    const metrics = {
      cpuUsage: os.loadavg()[0] / this.numCPUs, // CPU usage as a fraction of total capacity
      memoryUsage: process.memoryUsage(),
      totalMemory: os.totalmem(),
      freeMemory: os.freemem(),
      uptime: process.uptime(),
      workers: this.workers.size,
      workerMetrics: []
    };
    
    // Add worker metrics
    for (const [id, worker] of this.workers.entries()) {
      if (worker.metrics) {
        metrics.workerMetrics.push({
          id: worker.id,
          pid: worker.process.pid,
          ...worker.metrics
        });
      }
    }
    
    return metrics;
  }
  
  /**
   * Scale workers based on load
   */
  scaleWorkers() {
    if (!cluster.isPrimary) {
      return;
    }
    
    const cpuUsage = os.loadavg()[0] / this.numCPUs;
    
    // Scale up if CPU usage is high and we haven't reached max workers
    if (cpuUsage > 0.7 && this.workers.size < this.maxWorkers) {
      console.log(`High CPU usage (${cpuUsage.toFixed(2)}), adding a worker`);
      this.createWorker();
    }
    
    // Scale down if CPU usage is low and we have more than minimum workers
    if (cpuUsage < 0.3 && this.workers.size > 1) {
      console.log(`Low CPU usage (${cpuUsage.toFixed(2)}), removing a worker`);
      
      // Get the last worker
      const lastWorkerId = Array.from(this.workers.keys()).pop();
      const worker = this.workers.get(lastWorkerId);
      
      if (worker) {
        console.log(`Gracefully shutting down worker ${worker.process.pid}`);
        worker.send({ type: 'shutdown' });
        
        // Give the worker time to finish its tasks
        setTimeout(() => {
          if (this.workers.has(worker.id)) {
            worker.kill();
            this.workers.delete(worker.id);
          }
        }, 30000);
      }
    }
  }
}

module.exports = LoadBalancerService;
