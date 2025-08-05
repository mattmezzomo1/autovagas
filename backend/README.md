# JobHunt Backend

This is the backend API for the JobHunt platform, a job search and application automation system.

## Features

- User authentication with JWT and refresh tokens
- Document management (upload, generation with AI)
- Job listings and search
- Application tracking
- Auto-application robot for LinkedIn, InfoJobs, and Catho
- Personalized suggestions
- Subscription plans with Stripe integration
- Rate limiting for API protection
- Global error handling
- Comprehensive logging system
- File upload validation and configuration
- Database seeding for initial data

## Tech Stack

- NestJS - A progressive Node.js framework
- TypeORM - ORM for database interactions
- PostgreSQL - Relational database
- JWT - Authentication
- Stripe - Payment processing
- AWS S3 - File storage
- Puppeteer - Web scraping for auto-application

## Getting Started

### Prerequisites

- Node.js (v16+)
- PostgreSQL
- AWS account (for S3)
- Stripe account

### Installation

1. Clone the repository
2. Install dependencies:

```bash
cd backend
npm install
```

3. Create a `.env` file based on `.env.example`
4. Run database migrations:

```bash
npm run migration:run
```

5. Start the development server:

```bash
npm run start:dev
```

## API Documentation

API documentation is available at `/api/docs` when the server is running.

## Database Schema

The database consists of the following main entities:

- Users - User accounts (candidates and companies)
- Documents - User documents (resumes, cover letters, etc.)
- Jobs - Job listings
- Applications - Job applications
- AutoApplyConfigs - Configuration for the auto-application robot
- Companies - Company profiles
- Suggestions - Personalized suggestions for users

## Environment Variables

See `.env.example` for required environment variables.

## Development

### Creating a Migration

```bash
npm run migration:generate -- -n MigrationName
```

### Running Migrations

```bash
npm run migration:run
```

### Reverting Migrations

```bash
npm run migration:revert
```

### Seeding the Database

```bash
npm run seed
```

### Running Tests

```bash
npm test
```

### Running Tests with Coverage

```bash
npm run test:cov
```

## Deployment

For production deployment:

1. Build the application:

```bash
npm run build
```

2. Start the production server:

```bash
npm run start:prod
```

## License

This project is proprietary and confidential.
