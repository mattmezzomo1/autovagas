import { ScrapingTask, TaskDistributor } from './TaskDistributor';
import { ResultCollector } from './ResultCollector';

/**
 * Interface for extension information
 */
interface ExtensionInfo {
  version: string;
  userAgent: string;
  platform: string;
}

/**
 * Interface for extension status
 */
interface ExtensionStatus {
  userId: string;
  lastSeen: Date;
  status: 'idle' | 'processing';
  extensionInfo: ExtensionInfo;
  currentTask?: string;
}

/**
 * Service to coordinate Chrome extensions
 */
export class ExtensionCoordinatorService {
  private activeExtensions: Map<string, ExtensionStatus> = new Map();
  private taskDistributor: TaskDistributor;
  private resultCollector: ResultCollector;
  
  constructor() {
    this.taskDistributor = new TaskDistributor();
    this.resultCollector = new ResultCollector();
    
    // Start monitoring extension health
    setInterval(() => this.checkExtensionsHealth(), 60000);
  }
  
  /**
   * Register an extension as active
   */
  registerExtension(userId: string, extensionInfo: ExtensionInfo): void {
    this.activeExtensions.set(userId, {
      userId,
      lastSeen: new Date(),
      status: 'idle',
      extensionInfo
    });
    
    console.log(`Extension registered for user ${userId}`);
  }
  
  /**
   * Get tasks for an extension
   */
  async getTasksForExtension(userId: string): Promise<ScrapingTask[]> {
    // Update last seen time
    const extension = this.activeExtensions.get(userId);
    if (extension) {
      extension.lastSeen = new Date();
      this.activeExtensions.set(userId, extension);
    } else {
      // Extension not registered, register it with minimal info
      this.activeExtensions.set(userId, {
        userId,
        lastSeen: new Date(),
        status: 'idle',
        extensionInfo: {
          version: 'unknown',
          userAgent: 'unknown',
          platform: 'unknown'
        }
      });
    }
    
    // Get tasks for this user
    return this.taskDistributor.getTasksForUser(userId);
  }
  
  /**
   * Receive results from extension
   */
  async receiveResults(userId: string, taskId: string, results: any): Promise<void> {
    // Update extension status
    const extension = this.activeExtensions.get(userId);
    if (extension) {
      extension.status = 'idle';
      extension.currentTask = undefined;
      extension.lastSeen = new Date();
      this.activeExtensions.set(userId, extension);
    }
    
    // Process and store results
    await this.resultCollector.processResults(taskId, results);
    
    console.log(`Received results for task ${taskId} from user ${userId}`);
  }
  
  /**
   * Receive failure report from extension
   */
  async receiveFailure(userId: string, taskId: string, error: string): Promise<void> {
    // Update extension status
    const extension = this.activeExtensions.get(userId);
    if (extension) {
      extension.status = 'idle';
      extension.currentTask = undefined;
      extension.lastSeen = new Date();
      this.activeExtensions.set(userId, extension);
    }
    
    // Process failure
    await this.resultCollector.processFailure(taskId, error);
    
    console.log(`Received failure for task ${taskId} from user ${userId}: ${error}`);
  }
  
  /**
   * Check health of all extensions
   */
  private checkExtensionsHealth(): void {
    const now = new Date();
    
    for (const [userId, extension] of this.activeExtensions.entries()) {
      // If extension hasn't been seen in 5 minutes, consider it offline
      if (now.getTime() - extension.lastSeen.getTime() > 5 * 60 * 1000) {
        console.log(`Extension for user ${userId} is offline, removing`);
        this.activeExtensions.delete(userId);
        
        // Reassign any in-progress tasks
        if (extension.currentTask) {
          this.taskDistributor.reassignTask(extension.currentTask);
        }
      }
    }
  }
  
  /**
   * Get all active extensions
   */
  getActiveExtensions(): Map<string, ExtensionStatus> {
    return this.activeExtensions;
  }
}
