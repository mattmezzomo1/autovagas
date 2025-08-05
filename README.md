# AutoVagas

AutoVagas is a comprehensive job search platform that integrates with multiple job platforms (LinkedIn, InfoJobs, Catho, Indeed) using web scraping techniques.

## Features

- Integration with multiple job platforms
- Client-side scraping via Chrome extension for Basic tier users
- Server-side scraping with proxy rotation for Plus/Premium tier users
- Advanced caching strategies
- Scalable architecture to handle 50,000+ users

## Architecture

The system follows a 5-phase implementation roadmap:

1. **Chrome Extension Development**: Client-side scraping functionality
2. **Server Coordination**: Task distribution and result collection
3. **Server-Side Scraping Enhancement**: Proxy rotation and optimization
4. **Integration and Scaling**: Unified system with tier-based access
5. **Deployment with Docker and CI/CD**: Containerization and automated deployment

## Prerequisites

- Node.js 18+
- Docker and Docker Compose
- PostgreSQL 15+
- Redis 7+

## Development Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/autovagas.git
   cd autovagas
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Generate SSL certificates for development:
   ```bash
   npm run generate:ssl
   ```

4. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

5. Start the development environment:
   ```bash
   npm run docker:compose:build
   ```

6. Access the application:
   - API: http://localhost:3000/api
   - Grafana Dashboard: http://localhost:3001
   - Prometheus: http://localhost:9090

## Testing

The project includes comprehensive unit and integration tests. Here's how to run them:

1. Run all tests with coverage:
   ```bash
   npm test
   ```

2. Run unit tests only:
   ```bash
   npm run test:unit
   ```

3. Run integration tests only:
   ```bash
   npm run test:integration
   ```

4. Generate a detailed coverage report:
   ```bash
   npm run test:coverage
   ```

5. Run tests in watch mode during development:
   ```bash
   npm run test:watch
   ```

The coverage report will be available in the `coverage/html` directory. Open `coverage/html/index.html` in your browser to view it.

## Docker Deployment

### Local Deployment

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

### Production Deployment

1. Set up environment variables:
   ```bash
   cp .env.production .env
   ```

2. Deploy using Docker Compose:
   ```bash
   docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
   ```

3. Run database migrations:
   ```bash
   docker-compose exec api npm run migrate
   ```

## CI/CD Pipeline

The project uses GitHub Actions for CI/CD:

1. **CI Workflow**: Triggered on push to main/develop branches and pull requests
   - Linting
   - Testing
   - Building Docker images

2. **CD Workflow**: Triggered after successful CI on the main branch
   - Deployment to staging
   - Deployment to production
   - Creating GitHub releases

## Project Structure

```
.
├── .github/workflows      # GitHub Actions workflows
├── extension/             # Chrome extension code
├── grafana/               # Grafana configuration
├── nginx/                 # Nginx configuration
├── prometheus/            # Prometheus configuration
├── scripts/               # Utility scripts
├── src/                   # Server source code
│   ├── controllers/       # Request handlers
│   ├── middleware/        # Express middleware
│   ├── repositories/      # Database access
│   ├── routes/            # API routes
│   ├── services/          # Business logic
│   │   ├── cache/         # Caching services
│   │   ├── proxy/         # Proxy services
│   │   ├── scaling/       # Scaling services
│   │   ├── scraper/       # Scraping services
│   │   └── user/          # User services
│   ├── config.ts          # Configuration
│   ├── database.ts        # Database connection
│   └── index.ts           # Application entry point
├── .dockerignore          # Docker ignore file
├── .env.example           # Example environment variables
├── .env.production        # Production environment variables
├── .env.staging           # Staging environment variables
├── docker-compose.yml     # Docker Compose configuration
├── Dockerfile             # Docker configuration
└── README.md              # Project documentation
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.
