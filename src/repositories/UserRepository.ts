import { db } from '../database';

/**
 * Repository for user-related database operations
 */
export class UserRepository {
  /**
   * Find user by ID
   */
  async findById(userId: string): Promise<any> {
    try {
      const query = 'SELECT * FROM users WHERE id = $1';
      const result = await db.query(query, [userId]);
      
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error finding user by ID:', error);
      throw error;
    }
  }
  
  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<any> {
    try {
      const query = 'SELECT * FROM users WHERE email = $1';
      const result = await db.query(query, [email]);
      
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error finding user by email:', error);
      throw error;
    }
  }
  
  /**
   * Create a new user
   */
  async create(userData: any): Promise<any> {
    try {
      const { name, email, password, role } = userData;
      
      const query = `
        INSERT INTO users (name, email, password, role, created_at, updated_at)
        VALUES ($1, $2, $3, $4, NOW(), NOW())
        RETURNING *
      `;
      
      const result = await db.query(query, [name, email, password, role || 'user']);
      
      return result.rows[0];
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }
  
  /**
   * Update a user
   */
  async update(userId: string, userData: any): Promise<any> {
    try {
      const { name, email, role } = userData;
      
      const query = `
        UPDATE users
        SET name = $1, email = $2, role = $3, updated_at = NOW()
        WHERE id = $4
        RETURNING *
      `;
      
      const result = await db.query(query, [name, email, role, userId]);
      
      return result.rows[0];
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }
  
  /**
   * Delete a user
   */
  async delete(userId: string): Promise<boolean> {
    try {
      const query = 'DELETE FROM users WHERE id = $1';
      const result = await db.query(query, [userId]);
      
      return result.rowCount > 0;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }
  
  /**
   * Find all users
   */
  async findAll(): Promise<any[]> {
    try {
      const query = 'SELECT * FROM users ORDER BY created_at DESC';
      const result = await db.query(query);
      
      return result.rows;
    } catch (error) {
      console.error('Error finding all users:', error);
      throw error;
    }
  }
}
