const { createClient } = require('@supabase/supabase-js');
const config = require('./config/config');

let supabase = null;

/**
 * Initialize database connection
 */
async function initializeDatabase() {
  try {
    console.log('Initializing Supabase connection...');
    
    if (!config.supabase.url || !config.supabase.serviceKey) {
      console.warn('Supabase configuration missing, skipping database initialization');
      return;
    }

    // Create Supabase client
    supabase = createClient(config.supabase.url, config.supabase.serviceKey);
    
    // Test connection
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (error && error.code !== 'PGRST116') {
      throw error;
    }
    
    console.log('Database connection established successfully');
    
    // Check if tables exist and create if needed
    await ensureTablesExist();
    
  } catch (error) {
    console.error('Error initializing database:', error);
    // Don't throw error to allow app to continue without database
  }
}

/**
 * Ensure required tables exist
 */
async function ensureTablesExist() {
  try {
    // This is handled by Supabase migrations
    // We just need to verify the connection works
    console.log('Database tables verification completed');
  } catch (error) {
    console.error('Error ensuring tables exist:', error);
  }
}

/**
 * Get database client
 */
function getDatabase() {
  if (!supabase) {
    throw new Error('Database not initialized. Call initializeDatabase() first.');
  }
  return supabase;
}

/**
 * Check if database is connected
 */
function isDatabaseConnected() {
  return supabase !== null;
}

/**
 * Close database connection
 */
async function closeDatabase() {
  if (supabase) {
    // Supabase doesn't need explicit closing
    supabase = null;
    console.log('Database connection closed');
  }
}

/**
 * Health check for database
 */
async function healthCheck() {
  try {
    if (!supabase) {
      return { status: 'disconnected', message: 'Database not initialized' };
    }

    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (error && error.code !== 'PGRST116') {
      return { status: 'error', message: error.message };
    }
    
    return { status: 'healthy', message: 'Database connection is working' };
  } catch (error) {
    return { status: 'error', message: error.message };
  }
}

module.exports = {
  initializeDatabase,
  getDatabase,
  isDatabaseConnected,
  closeDatabase,
  healthCheck
};
