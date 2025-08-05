import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to check if user has admin privileges
 */
export const adminMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Check if user exists in request (set by authMiddleware)
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    // Check if user has admin role
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden - Admin access required' });
    }
    
    // User is admin, proceed
    next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
