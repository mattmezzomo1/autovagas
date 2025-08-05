import { Pool } from 'pg';
import { config } from './config';

// Create a connection pool
export const db = new Pool({
  host: config.database.host,
  port: config.database.port,
  user: config.database.username,
  password: config.database.password,
  database: config.database.database,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed
  connectionTimeoutMillis: 2000 // How long to wait for a connection to become available
});

// Log connection events
db.on('connect', () => {
  console.log('Connected to database');
});

db.on('error', (err) => {
  console.error('Database connection error:', err);
});

// Initialize database
export async function initializeDatabase() {
  try {
    // Check if tables exist
    const tablesExist = await checkTablesExist();
    
    if (!tablesExist) {
      console.log('Creating database tables...');
      await createTables();
      console.log('Database tables created successfully');
    } else {
      console.log('Database tables already exist');
    }
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

// Check if tables exist
async function checkTablesExist() {
  try {
    const query = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `;
    
    const result = await db.query(query);
    return result.rows[0].exists;
  } catch (error) {
    console.error('Error checking if tables exist:', error);
    throw error;
  }
}

// Create database tables
async function createTables() {
  const client = await db.connect();
  
  try {
    // Start transaction
    await client.query('BEGIN');
    
    // Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL DEFAULT 'user',
        created_at TIMESTAMP NOT NULL,
        updated_at TIMESTAMP NOT NULL
      );
    `);
    
    // Create plans table
    await client.query(`
      CREATE TABLE IF NOT EXISTS plans (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        features JSONB,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
    
    // Create subscriptions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS subscriptions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        plan_id INTEGER NOT NULL REFERENCES plans(id),
        status VARCHAR(50) NOT NULL,
        start_date TIMESTAMP NOT NULL,
        end_date TIMESTAMP,
        created_at TIMESTAMP NOT NULL,
        updated_at TIMESTAMP NOT NULL
      );
    `);
    
    // Create jobs table
    await client.query(`
      CREATE TABLE IF NOT EXISTS jobs (
        id VARCHAR(255) PRIMARY KEY,
        platform VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        company VARCHAR(255),
        location VARCHAR(255),
        description TEXT,
        url VARCHAR(1024),
        posted_date VARCHAR(255),
        salary VARCHAR(255),
        job_type VARCHAR(255),
        details JSONB,
        scraped_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
    
    // Create saved_jobs table
    await client.query(`
      CREATE TABLE IF NOT EXISTS saved_jobs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        job_id VARCHAR(255) NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
        notes TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
        UNIQUE(user_id, job_id)
      );
    `);
    
    // Create scraper_tasks table
    await client.query(`
      CREATE TABLE IF NOT EXISTS scraper_tasks (
        id VARCHAR(255) PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        platform VARCHAR(50) NOT NULL,
        type VARCHAR(50) NOT NULL,
        params JSONB NOT NULL,
        status VARCHAR(50) NOT NULL,
        result JSONB,
        error TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
        completed_at TIMESTAMP
      );
    `);
    
    // Commit transaction
    await client.query('COMMIT');
  } catch (error) {
    // Rollback transaction on error
    await client.query('ROLLBACK');
    console.error('Error creating database tables:', error);
    throw error;
  } finally {
    // Release client
    client.release();
  }
}
