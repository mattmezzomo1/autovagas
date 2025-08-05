import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../../src/users/entities/user.entity';
import { UserSubscription, UserSubscriptionTier } from '../../src/users/entities/user-subscription.entity';
import { Job, JobType, JobLevel, JobLocation, JobStatus } from '../../src/jobs/entities/job.entity';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

describe('JobsController (e2e)', () => {
  let app: INestApplication;
  let userRepository: Repository<User>;
  let userSubscriptionRepository: Repository<UserSubscription>;
  let jobRepository: Repository<Job>;
  let jwtService: JwtService;
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
    jobRepository = moduleFixture.get<Repository<Job>>(getRepositoryToken(Job));
    jwtService = moduleFixture.get<JwtService>(JwtService);

    // Create a test user
    const hashedPassword = await bcrypt.hash('TestPassword123!', 10);
    const testUser = userRepository.create({
      email: 'test-jobs@example.com',
      password: hashedPassword,
      name: 'Test Jobs User',
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

    // Create a test job
    const testJob = jobRepository.create({
      title: 'Software Engineer',
      description: 'Test job description',
      companyName: 'Test Company',
      type: JobType.FULL_TIME,
      level: JobLevel.MID_LEVEL,
      locationType: JobLocation.REMOTE,
      status: JobStatus.ACTIVE,
      userId: testUserId,
    });

    const savedJob = await jobRepository.save(testJob);
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
  });

  afterAll(async () => {
    // Clean up test data
    await jobRepository.delete({ userId: testUserId });
    await userSubscriptionRepository.delete({ userId: testUserId });
    await userRepository.delete({ id: testUserId });
    
    await app.close();
  });

  describe('/jobs (GET)', () => {
    it('should return jobs with pagination', () => {
      return request(app.getHttpServer())
        .get('/jobs')
        .expect(200)
        .expect(res => {
          expect(res.body).toHaveProperty('data');
          expect(res.body.data).toHaveProperty('items');
          expect(res.body.data).toHaveProperty('total');
          expect(res.body.data).toHaveProperty('page');
          expect(res.body.data).toHaveProperty('limit');
          expect(res.body.data).toHaveProperty('pages');
        });
    });

    it('should filter jobs by query', () => {
      return request(app.getHttpServer())
        .get('/jobs?query=software')
        .expect(200)
        .expect(res => {
          expect(res.body).toHaveProperty('data');
          expect(res.body.data.items.length).toBeGreaterThan(0);
          expect(res.body.data.items[0].title).toContain('Software');
        });
    });

    it('should filter jobs by type', () => {
      return request(app.getHttpServer())
        .get(`/jobs?types=${JobType.FULL_TIME}`)
        .expect(200)
        .expect(res => {
          expect(res.body).toHaveProperty('data');
          expect(res.body.data.items.length).toBeGreaterThan(0);
          expect(res.body.data.items[0].type).toBe(JobType.FULL_TIME);
        });
    });
  });

  describe('/jobs/:id (GET)', () => {
    it('should return a job by id', () => {
      return request(app.getHttpServer())
        .get(`/jobs/${testJobId}`)
        .expect(200)
        .expect(res => {
          expect(res.body).toHaveProperty('data');
          expect(res.body.data.id).toBe(testJobId);
          expect(res.body.data.title).toBe('Software Engineer');
          expect(res.body.data.companyName).toBe('Test Company');
        });
    });

    it('should return 404 for non-existent job', () => {
      return request(app.getHttpServer())
        .get('/jobs/999999999999')
        .expect(404);
    });
  });

  describe('/jobs (POST)', () => {
    it('should create a new job when authenticated', () => {
      return request(app.getHttpServer())
        .post('/jobs')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          title: 'Frontend Developer',
          description: 'We are looking for a Frontend Developer',
          companyName: 'Web Company',
          type: JobType.FULL_TIME,
          level: JobLevel.JUNIOR,
          locationType: JobLocation.REMOTE,
        })
        .expect(201)
        .expect(res => {
          expect(res.body).toHaveProperty('data');
          expect(res.body.data).toHaveProperty('id');
          expect(res.body.data.title).toBe('Frontend Developer');
          expect(res.body.data.companyName).toBe('Web Company');
          expect(res.body.data.userId).toBe(testUserId);
        });
    });

    it('should return 401 when not authenticated', () => {
      return request(app.getHttpServer())
        .post('/jobs')
        .send({
          title: 'Backend Developer',
          description: 'We are looking for a Backend Developer',
          companyName: 'API Company',
          type: JobType.FULL_TIME,
          level: JobLevel.SENIOR,
          locationType: JobLocation.REMOTE,
        })
        .expect(401);
    });

    it('should return 400 for invalid data', () => {
      return request(app.getHttpServer())
        .post('/jobs')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          // Missing required fields
          title: 'Invalid Job',
        })
        .expect(400)
        .expect(res => {
          expect(res.body).toHaveProperty('message');
          expect(res.body.message).toContain('Validation failed');
          expect(res.body).toHaveProperty('errors');
        });
    });
  });

  describe('/jobs/:id (PATCH)', () => {
    it('should update a job when authenticated as owner', () => {
      return request(app.getHttpServer())
        .patch(`/jobs/${testJobId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          title: 'Updated Software Engineer',
          description: 'Updated job description',
        })
        .expect(200)
        .expect(res => {
          expect(res.body).toHaveProperty('data');
          expect(res.body.data.id).toBe(testJobId);
          expect(res.body.data.title).toBe('Updated Software Engineer');
          expect(res.body.data.description).toBe('Updated job description');
        });
    });

    it('should return 401 when not authenticated', () => {
      return request(app.getHttpServer())
        .patch(`/jobs/${testJobId}`)
        .send({
          title: 'Unauthorized Update',
        })
        .expect(401);
    });

    it('should return 403 when not the owner', async () => {
      // Create another user
      const hashedPassword = await bcrypt.hash('AnotherPassword123!', 10);
      const anotherUser = await userRepository.save(
        userRepository.create({
          email: 'another-user@example.com',
          password: hashedPassword,
          name: 'Another User',
          role: UserRole.USER,
          isActive: true,
        }),
      );

      // Generate token for another user
      const anotherToken = jwtService.sign(
        { 
          sub: anotherUser.id, 
          email: anotherUser.email,
          role: anotherUser.role,
        },
        {
          secret: 'test-secret',
          expiresIn: '1h',
        },
      );

      const response = await request(app.getHttpServer())
        .patch(`/jobs/${testJobId}`)
        .set('Authorization', `Bearer ${anotherToken}`)
        .send({
          title: 'Forbidden Update',
        })
        .expect(403);

      // Clean up
      await userRepository.delete({ id: anotherUser.id });
    });
  });

  describe('/jobs/:id (DELETE)', () => {
    it('should delete a job when authenticated as owner', async () => {
      // Create a job to delete
      const jobToDelete = await jobRepository.save(
        jobRepository.create({
          title: 'Job to Delete',
          description: 'This job will be deleted',
          companyName: 'Delete Company',
          type: JobType.PART_TIME,
          level: JobLevel.ENTRY,
          locationType: JobLocation.ON_SITE,
          status: JobStatus.ACTIVE,
          userId: testUserId,
        }),
      );

      return request(app.getHttpServer())
        .delete(`/jobs/${jobToDelete.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect(res => {
          expect(res.body).toHaveProperty('message');
          expect(res.body.message).toContain('deleted successfully');
        });
    });

    it('should return 401 when not authenticated', () => {
      return request(app.getHttpServer())
        .delete(`/jobs/${testJobId}`)
        .expect(401);
    });
  });
});
