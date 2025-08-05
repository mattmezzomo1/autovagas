/**
 * Mock user data
 */
export const mockUsers = [
  {
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    password: '$2b$10$XpC5nKJ5.NI8biIooXiHUOAUtBO7myr2erC5Yd1Ii7VLRdaGjKPey', // password123
    role: 'user',
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
  },
  {
    id: '2',
    name: 'Admin User',
    email: 'admin@example.com',
    password: '$2b$10$XpC5nKJ5.NI8biIooXiHUOAUtBO7myr2erC5Yd1Ii7VLRdaGjKPey', // password123
    role: 'admin',
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
  },
];

/**
 * Mock plan data
 */
export const mockPlans = [
  {
    id: '1',
    name: 'Basic',
    price: 0,
    features: { serverSideScraping: false, maxSearches: 10, maxJobDetails: 50 },
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
  },
  {
    id: '2',
    name: 'Plus',
    price: 9.99,
    features: { serverSideScraping: true, maxSearches: 30, maxJobDetails: 150 },
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
  },
  {
    id: '3',
    name: 'Premium',
    price: 19.99,
    features: { serverSideScraping: true, maxSearches: 100, maxJobDetails: 500 },
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
  },
];

/**
 * Mock subscription data
 */
export const mockSubscriptions = [
  {
    id: '1',
    userId: '1',
    planId: '1',
    status: 'active',
    startDate: new Date('2023-01-01'),
    endDate: new Date('2023-12-31'),
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
  },
  {
    id: '2',
    userId: '2',
    planId: '3',
    status: 'active',
    startDate: new Date('2023-01-01'),
    endDate: new Date('2023-12-31'),
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
  },
];

/**
 * Mock job data
 */
export const mockJobs = [
  {
    id: 'job-1',
    platform: 'linkedin',
    title: 'Software Engineer',
    company: 'Tech Company',
    location: 'San Francisco, CA',
    description: 'We are looking for a software engineer...',
    url: 'https://linkedin.com/jobs/view/job-1',
    postedDate: '2023-01-15',
    salary: '$120,000 - $150,000',
    jobType: 'Full-time',
    details: { 
      requirements: ['JavaScript', 'React', 'Node.js'],
      benefits: ['Health insurance', 'Remote work'],
    },
    scrapedAt: new Date('2023-01-20'),
    createdAt: new Date('2023-01-20'),
    updatedAt: new Date('2023-01-20'),
  },
  {
    id: 'job-2',
    platform: 'indeed',
    title: 'Product Manager',
    company: 'Product Company',
    location: 'New York, NY',
    description: 'We are looking for a product manager...',
    url: 'https://indeed.com/jobs/view/job-2',
    postedDate: '2023-01-10',
    salary: '$130,000 - $160,000',
    jobType: 'Full-time',
    details: { 
      requirements: ['5+ years experience', 'MBA preferred'],
      benefits: ['Health insurance', 'Stock options'],
    },
    scrapedAt: new Date('2023-01-20'),
    createdAt: new Date('2023-01-20'),
    updatedAt: new Date('2023-01-20'),
  },
];

/**
 * Mock scraper task data
 */
export const mockScraperTasks = [
  {
    id: 'task-1',
    userId: '1',
    platform: 'linkedin',
    type: 'search',
    params: { keywords: ['software engineer'], locations: ['San Francisco'] },
    status: 'pending',
    result: null,
    error: null,
    createdAt: new Date('2023-01-20'),
    updatedAt: new Date('2023-01-20'),
    completedAt: null,
  },
  {
    id: 'task-2',
    userId: '1',
    platform: 'linkedin',
    type: 'job_details',
    params: { jobId: 'job-1', url: 'https://linkedin.com/jobs/view/job-1' },
    status: 'completed',
    result: mockJobs[0],
    error: null,
    createdAt: new Date('2023-01-20'),
    updatedAt: new Date('2023-01-20'),
    completedAt: new Date('2023-01-20'),
  },
];

/**
 * Mock proxy data
 */
export const mockProxies = [
  {
    id: '1',
    host: '192.168.1.1',
    port: 8080,
    username: 'user1',
    password: 'pass1',
    protocol: 'http',
    country: 'US',
    provider: 'brightdata',
    isResidential: true,
    lastChecked: new Date('2023-01-20'),
    isWorking: true,
    successRate: 0.95,
    responseTime: 200,
    usageCount: 10,
  },
  {
    id: '2',
    host: '192.168.1.2',
    port: 8080,
    username: 'user2',
    password: 'pass2',
    protocol: 'http',
    country: 'UK',
    provider: 'oxylabs',
    isResidential: true,
    lastChecked: new Date('2023-01-20'),
    isWorking: true,
    successRate: 0.90,
    responseTime: 250,
    usageCount: 5,
  },
];

/**
 * Mock scraped job search results
 */
export const mockScrapedJobResults = [
  {
    id: 'job-1',
    title: 'Software Engineer',
    company: 'Tech Company',
    location: 'San Francisco, CA',
    url: 'https://linkedin.com/jobs/view/job-1',
    postedDate: '2023-01-15',
    salary: '$120,000 - $150,000',
    jobType: 'Full-time',
  },
  {
    id: 'job-2',
    title: 'Senior Software Engineer',
    company: 'Another Tech Company',
    location: 'San Francisco, CA',
    url: 'https://linkedin.com/jobs/view/job-2',
    postedDate: '2023-01-14',
    salary: '$140,000 - $170,000',
    jobType: 'Full-time',
  },
];
