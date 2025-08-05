import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../../src/users/entities/user.entity';
import { UserSubscription, UserSubscriptionTier } from '../../src/users/entities/user-subscription.entity';
import { ScraperJob, ScraperJobStatus, ScraperPlatform } from '../../src/scrapers/entities/scraper-job.entity';
import { JobType, JobLevel, JobLocation } from '../../src/jobs/entities/job.entity';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ScraperJobService } from '../../src/scrapers/services/scraper-job.service';
import { LinkedInScraperService } from '../../src/scrapers/services/linkedin-scraper.service';
import { InfoJobsScraperService } from '../../src/scrapers/services/infojobs-scraper.service';
import { CathoScraperService } from '../../src/scrapers/services/catho-scraper.service';
import { IndeedScraperService } from '../../src/scrapers/services/indeed-scraper.service';

// Mock scraper services
jest.mock('../../src/scrapers/services/linkedin-scraper.service');
jest.mock('../../src/scrapers/services/infojobs-scraper.service');
jest.mock('../../src/scrapers/services/catho-scraper.service');
jest.mock('../../src/scrapers/services/indeed-scraper.service');

describe('ScrapersController (e2e)', () => {
  let app: INestApplication;
  let userRepository: Repository<User>;
  let userSubscriptionRepository: Repository<UserSubscription>;
  let scraperJobRepository: Repository<ScraperJob>;
  let jwtService: JwtService;
  let linkedInScraperService: LinkedInScraperService;
  let infoJobsScraperService: InfoJobsScraperService;
  let cathoScraperService: CathoScraperService;
  let indeedScraperService: IndeedScraperService;
  let accessToken: string;
  let testUserId: string;
  let testJobId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }));
    
    await app.init();

    userRepository = moduleFixture.get<Repository<User>>(getRepositoryToken(User));
    userSubscriptionRepository = moduleFixture.get<Repository<UserSubscription>>(
      getRepositoryToken(UserSubscription),
    );
    scraperJobRepository = moduleFixture.get<Repository<ScraperJob>>(
      getRepositoryToken(ScraperJob),
    );
    jwtService = moduleFixture.get<JwtService>(JwtService);
    linkedInScraperService = moduleFixture.get<LinkedInScraperService>(LinkedInScraperService);
    infoJobsScraperService = moduleFixture.get<InfoJobsScraperService>(InfoJobsScraperService);
    cathoScraperService = moduleFixture.get<CathoScraperService>(CathoScraperService);
    indeedScraperService = moduleFixture.get<IndeedScraperService>(IndeedScraperService);

    // Create a test user
    const hashedPassword = await bcrypt.hash('TestPassword123!', 10);
    const testUser = userRepository.create({
      email: 'test-scrapers@example.com',
      password: hashedPassword,
      name: 'Test Scrapers User',
      role: UserRole.USER,
      isActive: true,
    });

    const savedUser = await userRepository.save(testUser);
    testUserId = savedUser.id;

    // Create a subscription for the test user
    const testSubscription = userSubscriptionRepository.create({
      userId: testUserId,
      tier: UserSubscriptionTier.PLUS,
    });

    await userSubscriptionRepository.save(testSubscription);

    // Create a test scraper job
    const testJob = scraperJobRepository.create({
      userId: testUserId,
      platform: ScraperPlatform.LINKEDIN,
      status: ScraperJobStatus.COMPLETED,
      parameters: {
        query: 'software engineer',
        location: 'São Paulo',
        jobType: JobType.FULL_TIME,
        jobLevel: JobLevel.MID_LEVEL,
        jobLocation: JobLocation.REMOTE,
        page: 1,
        limit: 10,
      },
      results: {
        jobs: [
          {
            id: 'job-1',
            title: 'Software Engineer',
            company: 'Tech Company',
            location: 'São Paulo, Brazil',
            url: 'https://www.linkedin.com/jobs/view/job-1',
            description: 'Job description',
            salary: 'R$5,000 - R$8,000',
            postedAt: '2023-05-01',
          },
        ],
        totalJobs: 1,
        page: 1,
        totalPages: 1,
      },
      startedAt: new Date(),
      completedAt: new Date(),
    });

    const savedJob = await scraperJobRepository.save(testJob);
    testJobId = savedJob.id;

    // Generate access token
    accessToken = jwtService.sign(
      { 
        sub: testUserId, 
        email: savedUser.email,
        role: savedUser.role,
      },
      {
        secret: 'test-secret',
        expiresIn: '1h',
      },
    );

    // Mock scraper service methods
    (linkedInScraperService.processJob as jest.Mock).mockResolvedValue(undefined);
    (infoJobsScraperService.processJob as jest.Mock).mockResolvedValue(undefined);
    (cathoScraperService.processJob as jest.Mock).mockResolvedValue(undefined);
    (indeedScraperService.processJob as jest.Mock).mockResolvedValue(undefined);
  });

  afterAll(async () => {
    // Clean up test data
    await scraperJobRepository.delete({ userId: testUserId });
    await userSubscriptionRepository.delete({ userId: testUserId });
    await userRepository.delete({ id: testUserId });
    
    await app.close();
  });

  describe('/scrapers/jobs (GET)', () => {
    it('should return user scraper jobs when authenticated', () => {
      return request(app.getHttpServer())
        .get('/scrapers/jobs')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect(res => {
          expect(res.body).toHaveProperty('data');
          expect(res.body.data).toHaveProperty('items');
          expect(res.body.data).toHaveProperty('total');
          expect(res.body.data.items.length).toBeGreaterThan(0);
          expect(res.body.data.items[0].userId).toBe(testUserId);
        });
    });

    it('should return 401 when not authenticated', () => {
      return request(app.getHttpServer())
        .get('/scrapers/jobs')
        .expect(401);
    });
  });

  describe('/scrapers/jobs/:id (GET)', () => {
    it('should return a scraper job by id when authenticated', () => {
      return request(app.getHttpServer())
        .get(`/scrapers/jobs/${testJobId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect(res => {
          expect(res.body).toHaveProperty('data');
          expect(res.body.data.id).toBe(testJobId);
          expect(res.body.data.userId).toBe(testUserId);
          expect(res.body.data.platform).toBe(ScraperPlatform.LINKEDIN);
          expect(res.body.data).toHaveProperty('results');
          expect(res.body.data.results).toHaveProperty('jobs');
        });
    });

    it('should return 401 when not authenticated', () => {
      return request(app.getHttpServer())
        .get(`/scrapers/jobs/${testJobId}`)
        .expect(401);
    });

    it('should return 404 for non-existent job', () => {
      return request(app.getHttpServer())
        .get('/scrapers/jobs/999999999999')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });
  });

  describe('/scrapers/search (POST)', () => {
    it('should create a scraper job when authenticated', () => {
      return request(app.getHttpServer())
        .post('/scrapers/search')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          query: 'frontend developer',
          location: 'Rio de Janeiro',
          types: [JobType.FULL_TIME],
          levels: [JobLevel.JUNIOR, JobLevel.MID_LEVEL],
          locationTypes: [JobLocation.REMOTE],
          platforms: ['linkedin', 'infojobs'],
        })
        .expect(201)
        .expect(res => {
          expect(res.body).toHaveProperty('data');
          expect(res.body.data).toHaveProperty('jobs');
          expect(res.body.data.jobs.length).toBe(2); // One for each platform
          expect(res.body.data.jobs[0]).toHaveProperty('id');
          expect(res.body.data.jobs[0]).toHaveProperty('platform');
          expect(res.body.data.jobs[0]).toHaveProperty('status');
          expect(res.body.data.jobs[0].userId).toBe(testUserId);
        });
    });

    it('should return 401 when not authenticated', () => {
      return request(app.getHttpServer())
        .post('/scrapers/search')
        .send({
          query: 'frontend developer',
          platforms: ['linkedin'],
        })
        .expect(401);
    });

    it('should return 400 for invalid data', () => {
      return request(app.getHttpServer())
        .post('/scrapers/search')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          // Missing required fields
          platforms: ['invalid_platform'],
        })
        .expect(400)
        .expect(res => {
          expect(res.body).toHaveProperty('message');
          expect(res.body.message).toContain('Validation failed');
          expect(res.body).toHaveProperty('errors');
        });
    });
  });

  describe('/scrapers/jobs/:id/retry (POST)', () => {
    it('should retry a failed scraper job when authenticated', async () => {
      // Create a failed job first
      const failedJob = await scraperJobRepository.save(
        scraperJobRepository.create({
          userId: testUserId,
          platform: ScraperPlatform.LINKEDIN,
          status: ScraperJobStatus.FAILED,
          parameters: {
            query: 'failed job',
            platforms: ['linkedin'],
          },
          error: 'Test error',
          startedAt: new Date(),
          completedAt: new Date(),
        }),
      );

      return request(app.getHttpServer())
        .post(`/scrapers/jobs/${failedJob.id}/retry`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect(res => {
          expect(res.body).toHaveProperty('data');
          expect(res.body.data).toHaveProperty('id');
          expect(res.body.data.status).toBe(ScraperJobStatus.PENDING);
          expect(res.body.data.userId).toBe(testUserId);
          expect(res.body.data.platform).toBe(ScraperPlatform.LINKEDIN);
        });
    });

    it('should return 401 when not authenticated', async () => {
      // Create a failed job first
      const failedJob = await scraperJobRepository.save(
        scraperJobRepository.create({
          userId: testUserId,
          platform: ScraperPlatform.LINKEDIN,
          status: ScraperJobStatus.FAILED,
          parameters: {
            query: 'another failed job',
            platforms: ['linkedin'],
          },
          error: 'Test error',
          startedAt: new Date(),
          completedAt: new Date(),
        }),
      );

      return request(app.getHttpServer())
        .post(`/scrapers/jobs/${failedJob.id}/retry`)
        .expect(401);
    });
  });
});
