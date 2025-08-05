import { UserRepository } from '../../repositories/UserRepository';
import { SubscriptionRepository } from '../../repositories/SubscriptionRepository';

/**
 * Service for user-related operations
 */
export class UserService {
  private userRepository: UserRepository;
  private subscriptionRepository: SubscriptionRepository;
  
  constructor() {
    this.userRepository = new UserRepository();
    this.subscriptionRepository = new SubscriptionRepository();
  }
  
  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<any> {
    try {
      // Get user from repository
      const user = await this.userRepository.findById(userId);
      
      if (!user) {
        return null;
      }
      
      // Get user's subscription
      const subscription = await this.subscriptionRepository.findByUserId(userId);
      
      // Add subscription to user object
      return {
        ...user,
        subscription
      };
    } catch (error) {
      console.error('Error getting user by ID:', error);
      throw error;
    }
  }
  
  /**
   * Get user's subscription tier
   */
  async getUserTier(userId: string): Promise<string> {
    try {
      // Get user's subscription
      const subscription = await this.subscriptionRepository.findByUserId(userId);
      
      if (!subscription || !subscription.plan) {
        return 'basic';
      }
      
      const planName = subscription.plan.name.toLowerCase();
      
      if (planName.includes('premium')) {
        return 'premium';
      } else if (planName.includes('plus')) {
        return 'plus';
      }
      
      return 'basic';
    } catch (error) {
      console.error('Error getting user tier:', error);
      return 'basic';
    }
  }
  
  /**
   * Check if user's subscription is active
   */
  async isSubscriptionActive(userId: string): Promise<boolean> {
    try {
      // Get user's subscription
      const subscription = await this.subscriptionRepository.findByUserId(userId);
      
      if (!subscription) {
        return false;
      }
      
      // Check if subscription is active
      const now = new Date();
      return subscription.status === 'active' && 
             subscription.endDate && 
             new Date(subscription.endDate) > now;
    } catch (error) {
      console.error('Error checking subscription status:', error);
      return false;
    }
  }
  
  /**
   * Get all users with active subscriptions
   */
  async getUsersWithActiveSubscriptions(): Promise<any[]> {
    try {
      // Get all active subscriptions
      const activeSubscriptions = await this.subscriptionRepository.findActiveSubscriptions();
      
      // Get users for active subscriptions
      const users = [];
      
      for (const subscription of activeSubscriptions) {
        const user = await this.userRepository.findById(subscription.userId);
        
        if (user) {
          users.push({
            ...user,
            subscription
          });
        }
      }
      
      return users;
    } catch (error) {
      console.error('Error getting users with active subscriptions:', error);
      throw error;
    }
  }
}
