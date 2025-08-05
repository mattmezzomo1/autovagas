import { db } from '../../src/database';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { config } from '../../src/config';

/**
 * Create a test user in the database
 */
export async function createTestUser(userData: any = {}) {
  const defaultUser = {
    name: 'Test User',
    email: `test-${Date.now()}@example.com`,
    password: await bcrypt.hash('password123', 10),
    role: 'user',
  };

  const user = { ...defaultUser, ...userData };

  const query = `
    INSERT INTO users (name, email, password, role, created_at, updated_at)
    VALUES ($1, $2, $3, $4, NOW(), NOW())
    RETURNING id, name, email, role, created_at, updated_at
  `;

  const result = await db.query(query, [user.name, user.email, user.password, user.role]);
  return result.rows[0];
}

/**
 * Create a test subscription in the database
 */
export async function createTestSubscription(subscriptionData: any = {}) {
  const defaultSubscription = {
    status: 'active',
    startDate: new Date(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
  };

  const subscription = { ...defaultSubscription, ...subscriptionData };

  const query = `
    INSERT INTO subscriptions (user_id, plan_id, status, start_date, end_date, created_at, updated_at)
    VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
    RETURNING id, user_id, plan_id, status, start_date, end_date, created_at, updated_at
  `;

  const result = await db.query(query, [
    subscription.userId,
    subscription.planId,
    subscription.status,
    subscription.startDate,
    subscription.endDate,
  ]);
  
  return result.rows[0];
}

/**
 * Create a test plan in the database
 */
export async function createTestPlan(planData: any = {}) {
  const defaultPlan = {
    name: 'Test Plan',
    price: 9.99,
    features: JSON.stringify({ feature1: true, feature2: false }),
  };

  const plan = { ...defaultPlan, ...planData };

  const query = `
    INSERT INTO plans (name, price, features, created_at, updated_at)
    VALUES ($1, $2, $3, NOW(), NOW())
    RETURNING id, name, price, features, created_at, updated_at
  `;

  const result = await db.query(query, [plan.name, plan.price, plan.features]);
  return result.rows[0];
}

/**
 * Generate a JWT token for testing
 */
export function generateTestToken(userId: string, role: string = 'user') {
  return jwt.sign(
    { id: userId, role },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );
}

/**
 * Clean up test data from the database
 */
export async function cleanupTestData() {
  // Delete test users and related data
  await db.query('DELETE FROM subscriptions WHERE user_id IN (SELECT id FROM users WHERE email LIKE \'test-%@example.com\')');
  await db.query('DELETE FROM users WHERE email LIKE \'test-%@example.com\'');
  
  // Delete test plans
  await db.query('DELETE FROM plans WHERE name = \'Test Plan\'');
}

/**
 * Create a test job in the database
 */
export async function createTestJob(jobData: any = {}) {
  const defaultJob = {
    id: `job-${Date.now()}`,
    platform: 'linkedin',
    title: 'Test Job',
    company: 'Test Company',
    location: 'Test Location',
    description: 'Test Description',
    url: 'https://example.com/job',
    postedDate: '2023-01-01',
    salary: '$100,000',
    jobType: 'Full-time',
    details: JSON.stringify({ detail1: 'value1', detail2: 'value2' }),
    scrapedAt: new Date(),
  };

  const job = { ...defaultJob, ...jobData };

  const query = `
    INSERT INTO jobs (id, platform, title, company, location, description, url, posted_date, salary, job_type, details, scraped_at, created_at, updated_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW())
    RETURNING *
  `;

  const result = await db.query(query, [
    job.id,
    job.platform,
    job.title,
    job.company,
    job.location,
    job.description,
    job.url,
    job.postedDate,
    job.salary,
    job.jobType,
    job.details,
    job.scrapedAt,
  ]);
  
  return result.rows[0];
}

/**
 * Create a test scraper task in the database
 */
export async function createTestScraperTask(taskData: any = {}) {
  const defaultTask = {
    id: `task-${Date.now()}`,
    platform: 'linkedin',
    type: 'search',
    params: JSON.stringify({ keywords: ['test'] }),
    status: 'pending',
  };

  const task = { ...defaultTask, ...taskData };

  const query = `
    INSERT INTO scraper_tasks (id, user_id, platform, type, params, status, created_at, updated_at)
    VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
    RETURNING *
  `;

  const result = await db.query(query, [
    task.id,
    task.userId,
    task.platform,
    task.type,
    task.params,
    task.status,
  ]);
  
  return result.rows[0];
}
