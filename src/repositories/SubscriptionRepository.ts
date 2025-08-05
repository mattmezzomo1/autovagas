import { db } from '../database';

/**
 * Repository for subscription-related database operations
 */
export class SubscriptionRepository {
  /**
   * Find subscription by ID
   */
  async findById(subscriptionId: string): Promise<any> {
    try {
      const query = `
        SELECT s.*, p.name as plan_name, p.price as plan_price, p.features as plan_features
        FROM subscriptions s
        JOIN plans p ON s.plan_id = p.id
        WHERE s.id = $1
      `;
      
      const result = await db.query(query, [subscriptionId]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      // Format the result
      const subscription = result.rows[0];
      return {
        id: subscription.id,
        userId: subscription.user_id,
        status: subscription.status,
        startDate: subscription.start_date,
        endDate: subscription.end_date,
        createdAt: subscription.created_at,
        updatedAt: subscription.updated_at,
        plan: {
          id: subscription.plan_id,
          name: subscription.plan_name,
          price: subscription.plan_price,
          features: subscription.plan_features
        }
      };
    } catch (error) {
      console.error('Error finding subscription by ID:', error);
      throw error;
    }
  }
  
  /**
   * Find subscription by user ID
   */
  async findByUserId(userId: string): Promise<any> {
    try {
      const query = `
        SELECT s.*, p.name as plan_name, p.price as plan_price, p.features as plan_features
        FROM subscriptions s
        JOIN plans p ON s.plan_id = p.id
        WHERE s.user_id = $1
        ORDER BY s.created_at DESC
        LIMIT 1
      `;
      
      const result = await db.query(query, [userId]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      // Format the result
      const subscription = result.rows[0];
      return {
        id: subscription.id,
        userId: subscription.user_id,
        status: subscription.status,
        startDate: subscription.start_date,
        endDate: subscription.end_date,
        createdAt: subscription.created_at,
        updatedAt: subscription.updated_at,
        plan: {
          id: subscription.plan_id,
          name: subscription.plan_name,
          price: subscription.plan_price,
          features: subscription.plan_features
        }
      };
    } catch (error) {
      console.error('Error finding subscription by user ID:', error);
      throw error;
    }
  }
  
  /**
   * Create a new subscription
   */
  async create(subscriptionData: any): Promise<any> {
    try {
      const { userId, planId, status, startDate, endDate } = subscriptionData;
      
      const query = `
        INSERT INTO subscriptions (user_id, plan_id, status, start_date, end_date, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
        RETURNING *
      `;
      
      const result = await db.query(query, [userId, planId, status, startDate, endDate]);
      
      return result.rows[0];
    } catch (error) {
      console.error('Error creating subscription:', error);
      throw error;
    }
  }
  
  /**
   * Update a subscription
   */
  async update(subscriptionId: string, subscriptionData: any): Promise<any> {
    try {
      const { status, endDate } = subscriptionData;
      
      const query = `
        UPDATE subscriptions
        SET status = $1, end_date = $2, updated_at = NOW()
        WHERE id = $3
        RETURNING *
      `;
      
      const result = await db.query(query, [status, endDate, subscriptionId]);
      
      return result.rows[0];
    } catch (error) {
      console.error('Error updating subscription:', error);
      throw error;
    }
  }
  
  /**
   * Find all active subscriptions
   */
  async findActiveSubscriptions(): Promise<any[]> {
    try {
      const query = `
        SELECT s.*, p.name as plan_name, p.price as plan_price, p.features as plan_features
        FROM subscriptions s
        JOIN plans p ON s.plan_id = p.id
        WHERE s.status = 'active' AND s.end_date > NOW()
        ORDER BY s.created_at DESC
      `;
      
      const result = await db.query(query);
      
      // Format the results
      return result.rows.map(subscription => ({
        id: subscription.id,
        userId: subscription.user_id,
        status: subscription.status,
        startDate: subscription.start_date,
        endDate: subscription.end_date,
        createdAt: subscription.created_at,
        updatedAt: subscription.updated_at,
        plan: {
          id: subscription.plan_id,
          name: subscription.plan_name,
          price: subscription.plan_price,
          features: subscription.plan_features
        }
      }));
    } catch (error) {
      console.error('Error finding active subscriptions:', error);
      throw error;
    }
  }
}
