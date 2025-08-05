import { mockUsers, mockPlans, mockSubscriptions, mockJobs, mockScraperTasks } from './mockData';

// Mock database implementation
export const mockDb = {
  query: jest.fn().mockImplementation((text, params) => {
    // Mock query implementation based on the query text
    if (text.includes('SELECT * FROM users WHERE id = $1')) {
      const userId = params[0];
      const user = mockUsers.find(u => u.id === userId);
      return Promise.resolve({ rows: user ? [user] : [] });
    }
    
    if (text.includes('SELECT * FROM users WHERE email = $1')) {
      const email = params[0];
      const user = mockUsers.find(u => u.email === email);
      return Promise.resolve({ rows: user ? [user] : [] });
    }
    
    if (text.includes('SELECT * FROM plans')) {
      return Promise.resolve({ rows: mockPlans });
    }
    
    if (text.includes('SELECT * FROM subscriptions WHERE user_id = $1')) {
      const userId = params[0];
      const subscription = mockSubscriptions.find(s => s.userId === userId);
      return Promise.resolve({ rows: subscription ? [subscription] : [] });
    }
    
    if (text.includes('SELECT * FROM jobs WHERE id = $1')) {
      const jobId = params[0];
      const job = mockJobs.find(j => j.id === jobId);
      return Promise.resolve({ rows: job ? [job] : [] });
    }
    
    if (text.includes('SELECT * FROM scraper_tasks WHERE id = $1')) {
      const taskId = params[0];
      const task = mockScraperTasks.find(t => t.id === taskId);
      return Promise.resolve({ rows: task ? [task] : [] });
    }
    
    if (text.includes('SELECT * FROM scraper_tasks WHERE user_id = $1')) {
      const userId = params[0];
      const tasks = mockScraperTasks.filter(t => t.userId === userId);
      return Promise.resolve({ rows: tasks });
    }
    
    if (text.includes('INSERT INTO users')) {
      const [name, email, password, role] = params;
      const newUser = {
        id: `${mockUsers.length + 1}`,
        name,
        email,
        password,
        role,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      return Promise.resolve({ rows: [newUser] });
    }
    
    if (text.includes('INSERT INTO subscriptions')) {
      const [userId, planId, status, startDate, endDate] = params;
      const newSubscription = {
        id: `${mockSubscriptions.length + 1}`,
        userId,
        planId,
        status,
        startDate,
        endDate,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      return Promise.resolve({ rows: [newSubscription] });
    }
    
    if (text.includes('INSERT INTO scraper_tasks')) {
      const [id, userId, platform, type, params, status] = params;
      const newTask = {
        id,
        userId,
        platform,
        type,
        params,
        status,
        result: null,
        error: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        completedAt: null,
      };
      return Promise.resolve({ rows: [newTask] });
    }
    
    if (text.includes('UPDATE scraper_tasks')) {
      const taskId = params[params.length - 1];
      const task = mockScraperTasks.find(t => t.id === taskId);
      if (task) {
        const updatedTask = { ...task, updatedAt: new Date() };
        return Promise.resolve({ rows: [updatedTask] });
      }
      return Promise.resolve({ rows: [] });
    }
    
    // Default response for unhandled queries
    return Promise.resolve({ rows: [] });
  }),
  
  // Mock other database methods
  connect: jest.fn().mockResolvedValue({
    query: jest.fn(),
    release: jest.fn(),
  }),
  
  end: jest.fn().mockResolvedValue(undefined),
};

// Export a function to reset the mock
export function resetMockDb() {
  mockDb.query.mockClear();
  mockDb.connect.mockClear();
  mockDb.end.mockClear();
}
