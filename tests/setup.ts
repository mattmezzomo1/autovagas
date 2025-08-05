import * as dotenv from 'dotenv';
import { db } from '../src/database';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Set test environment
process.env.NODE_ENV = 'test';

// Global setup before all tests
beforeAll(async () => {
  // Initialize test database if needed
  // This is a good place to set up test data

  // Increase timeout for database operations
  jest.setTimeout(30000);
});

// Global teardown after all tests
afterAll(async () => {
  // Close database connection
  await db.end();
});

// Reset mocks after each test
afterEach(() => {
  jest.clearAllMocks();
});
