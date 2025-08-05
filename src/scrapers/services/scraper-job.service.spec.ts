import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ScraperJobService } from './scraper-job.service';
import { ScraperJob, ScraperJobStatus, ScraperPlatform } from '../entities/scraper-job.entity';
import { JobType, JobLevel, JobLocation } from '../../jobs/entities/job.entity';
import { NotFoundException } from '@nestjs/common';

describe('ScraperJobService', () => {
  let scraperJobService: ScraperJobService;
  let scraperJobRepository: Repository<ScraperJob>;

  const mockScraperJobRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn(),
    })),
  };

  const mockScraperJob: ScraperJob = {
    id: '1',
    userId: 'user-1',
    platform: ScraperPlatform.LINKEDIN,
    status: ScraperJobStatus.PENDING,
    parameters: {
      query: 'software engineer',
      location: 'São Paulo',
      jobType: JobType.FULL_TIME,
      jobLevel: JobLevel.MID_LEVEL,
      jobLocation: JobLocation.REMOTE,
      page: 1,
      limit: 10,
    },
    results: null,
    error: null,
    startedAt: null,
    completedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ScraperJobService,
        {
          provide: getRepositoryToken(ScraperJob),
          useValue: mockScraperJobRepository,
        },
      ],
    }).compile();

    scraperJobService = module.get<ScraperJobService>(ScraperJobService);
    scraperJobRepository = module.get<Repository<ScraperJob>>(getRepositoryToken(ScraperJob));

    // Reset mocks
    jest.clearAllMocks();
  });

  describe('createJob', () => {
    it('should create a new scraper job', async () => {
      // Arrange
      const userId = 'user-1';
      const platform = ScraperPlatform.LINKEDIN;
      const parameters = {
        query: 'software engineer',
        location: 'São Paulo',
        jobType: JobType.FULL_TIME,
        jobLevel: JobLevel.MID_LEVEL,
        jobLocation: JobLocation.REMOTE,
        page: 1,
        limit: 10,
      };
      const processImmediately = false;

      mockScraperJobRepository.create.mockReturnValue({
        userId,
        platform,
        parameters,
        status: ScraperJobStatus.PENDING,
      });
      
      mockScraperJobRepository.save.mockResolvedValue({
        id: '1',
        userId,
        platform,
        parameters,
        status: ScraperJobStatus.PENDING,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });

      // Act
      const result = await scraperJobService.createJob(userId, platform, parameters, processImmediately);

      // Assert
      expect(result).toEqual({
        id: '1',
        userId,
        platform,
        parameters,
        status: ScraperJobStatus.PENDING,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
      expect(mockScraperJobRepository.create).toHaveBeenCalledWith({
        userId,
        platform,
        parameters,
        status: ScraperJobStatus.PENDING,
      });
      expect(mockScraperJobRepository.save).toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('should return a scraper job by id', async () => {
      // Arrange
      mockScraperJobRepository.findOne.mockResolvedValue(mockScraperJob);

      // Act
      const result = await scraperJobService.findById('1');

      // Assert
      expect(result).toEqual(mockScraperJob);
      expect(mockScraperJobRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('should return null if job not found', async () => {
      // Arrange
      mockScraperJobRepository.findOne.mockResolvedValue(null);

      // Act
      const result = await scraperJobService.findById('999');

      // Assert
      expect(result).toBeNull();
      expect(mockScraperJobRepository.findOne).toHaveBeenCalledWith({
        where: { id: '999' },
      });
    });
  });

  describe('findByUserId', () => {
    it('should return scraper jobs for a user with pagination', async () => {
      // Arrange
      const userId = 'user-1';
      const page = 1;
      const limit = 10;
      
      const mockQueryBuilder = mockScraperJobRepository.createQueryBuilder();
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[mockScraperJob], 1]);

      // Act
      const result = await scraperJobService.findByUserId(userId, page, limit);

      // Assert
      expect(result).toEqual({
        items: [mockScraperJob],
        total: 1,
        page: 1,
        limit: 10,
        pages: 1,
      });
      expect(mockScraperJobRepository.createQueryBuilder).toHaveBeenCalled();
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('job.userId = :userId', { userId });
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('job.createdAt', 'DESC');
      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(0);
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(10);
      expect(mockQueryBuilder.getManyAndCount).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update a scraper job', async () => {
      // Arrange
      const jobId = '1';
      const updateData = {
        status: ScraperJobStatus.PROCESSING,
        startedAt: new Date(),
      };
      
      mockScraperJobRepository.findOne.mockResolvedValue(mockScraperJob);
      mockScraperJobRepository.save.mockResolvedValue({
        ...mockScraperJob,
        ...updateData,
        updatedAt: expect.any(Date),
      });

      // Act
      const result = await scraperJobService.update(jobId, updateData);

      // Assert
      expect(result).toEqual({
        ...mockScraperJob,
        ...updateData,
        updatedAt: expect.any(Date),
      });
      expect(mockScraperJobRepository.findOne).toHaveBeenCalledWith({
        where: { id: jobId },
      });
      expect(mockScraperJobRepository.save).toHaveBeenCalledWith({
        ...mockScraperJob,
        ...updateData,
        updatedAt: expect.any(Date),
      });
    });

    it('should throw NotFoundException if job not found', async () => {
      // Arrange
      const jobId = '999';
      const updateData = {
        status: ScraperJobStatus.PROCESSING,
      };
      
      mockScraperJobRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(scraperJobService.update(jobId, updateData)).rejects.toThrow(NotFoundException);
      expect(mockScraperJobRepository.findOne).toHaveBeenCalledWith({
        where: { id: jobId },
      });
      expect(mockScraperJobRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('saveJobResults', () => {
    it('should save job results and mark job as completed', async () => {
      // Arrange
      const jobId = '1';
      const results = {
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
      };
      
      mockScraperJobRepository.findOne.mockResolvedValue(mockScraperJob);
      mockScraperJobRepository.save.mockResolvedValue({
        ...mockScraperJob,
        status: ScraperJobStatus.COMPLETED,
        results,
        completedAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });

      // Act
      const result = await scraperJobService.saveJobResults(jobId, results);

      // Assert
      expect(result).toEqual({
        ...mockScraperJob,
        status: ScraperJobStatus.COMPLETED,
        results,
        completedAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
      expect(mockScraperJobRepository.findOne).toHaveBeenCalledWith({
        where: { id: jobId },
      });
      expect(mockScraperJobRepository.save).toHaveBeenCalledWith({
        ...mockScraperJob,
        status: ScraperJobStatus.COMPLETED,
        results,
        completedAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
    });
  });

  describe('markJobAsFailed', () => {
    it('should mark job as failed with error message', async () => {
      // Arrange
      const jobId = '1';
      const errorMessage = 'Scraping failed';
      
      mockScraperJobRepository.findOne.mockResolvedValue(mockScraperJob);
      mockScraperJobRepository.save.mockResolvedValue({
        ...mockScraperJob,
        status: ScraperJobStatus.FAILED,
        error: errorMessage,
        completedAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });

      // Act
      const result = await scraperJobService.markJobAsFailed(jobId, errorMessage);

      // Assert
      expect(result).toEqual({
        ...mockScraperJob,
        status: ScraperJobStatus.FAILED,
        error: errorMessage,
        completedAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
      expect(mockScraperJobRepository.findOne).toHaveBeenCalledWith({
        where: { id: jobId },
      });
      expect(mockScraperJobRepository.save).toHaveBeenCalledWith({
        ...mockScraperJob,
        status: ScraperJobStatus.FAILED,
        error: errorMessage,
        completedAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
    });
  });
});
