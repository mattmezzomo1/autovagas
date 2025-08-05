import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';

// Import routes
import scraperRoutes from './routes/scraper.routes';
import extensionRoutes from './routes/extension.routes';
import extensionDashboardRoutes from './routes/extension-dashboard.routes';
import linkedinAuthRoutes from './routes/linkedinAuth.routes';
import linkedinJobsRoutes from './routes/linkedinJobs.routes';
import proxyRoutes from './routes/proxy.routes';
import cacheRoutes from './routes/cache.routes';
import tierScraperRoutes from './routes/tier-scraper.routes';
import unifiedScraperRoutes from './routes/unified-scraper.routes';
import scraperMonitorRoutes from './routes/scraperMonitorRoutes';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(helmet());
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('dev'));

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again after 15 minutes'
});

// Apply rate limiting to all routes
app.use('/api/', apiLimiter);

// Routes
app.use('/api/scraper', scraperRoutes);
app.use('/api/extension', extensionRoutes);
app.use('/api/extension-dashboard', extensionDashboardRoutes);
app.use('/api/linkedin-auth', linkedinAuthRoutes);
app.use('/api/linkedin-jobs', linkedinJobsRoutes);
app.use('/api/proxy', proxyRoutes);
app.use('/api/cache', cacheRoutes);
app.use('/api/tier-scraper', tierScraperRoutes);
app.use('/api/unified-scraper', unifiedScraperRoutes);
app.use('/api/scraper-monitor', scraperMonitorRoutes);

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
