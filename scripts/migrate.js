const { initializeDatabase } = require('../dist/database');

// Run database migrations
async function runMigrations() {
  try {
    console.log('Running database migrations...');
    await initializeDatabase();
    console.log('Database migrations completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Error running database migrations:', error);
    process.exit(1);
  }
}

runMigrations();
