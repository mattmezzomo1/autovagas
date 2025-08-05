import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { AutoApplyService } from './auto-apply.service';
import { UsersService } from '../../users/services/users.service';
import { DocumentsService } from '../../documents/services/documents.service';
import { JobsService } from '../../jobs/services/jobs.service';
import { AutoApplyHistory, AutoApplyStatus } from '../entities/auto-apply-history.entity';
import { AutoApplyPreference } from '../entities/auto-apply-preference.entity';
import { UserSubscriptionTier } from '../../users/entities/user-subscription.entity';
import { JobType, JobLevel, JobLocation, JobStatus } from '../../jobs/entities/job.entity';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('AutoApplyService', () => {
  let autoApplyService: AutoApplyService;
  let autoApplyHistoryRepository: Repository<AutoApplyHistory>;
  let autoApplyPreferenceRepository: Repository<AutoApplyPreference>;
  let usersService: UsersService;
  let documentsService: DocumentsService;
  let jobsService: JobsService;

  const mockAutoApplyHistoryRepository = {
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

  const mockAutoApplyPreferenceRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    upsert: jest.fn(),
  };

  const mockUsersService = {
    findById: jest.fn(),
    getUserSubscriptionTier: jest.fn(),
  };

  const mockDocumentsService = {
    findByUserId: jest.fn(),
    findById: jest.fn(),
    getDefaultResume: jest.fn(),
    getDefaultCoverLetter: jest.fn(),
  };

  const mockJobsService = {
    findOne: jest.fn(),
    findAll: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  const mockAutoApplyHistory: AutoApplyHistory = {
    id: '1',
    userId: 'user-1',
    jobId: 'job-1',
    status: AutoApplyStatus.COMPLETED,
    platform: 'LINKEDIN',
    applicationUrl: 'https://www.linkedin.com/jobs/view/job-1',
    resumeId: 'resume-1',
    coverLetterId: 'cover-letter-1',
    error: null,
    metadata: {},
    createdAt: new Date(),
    updatedAt: new Date(),
    completedAt: new Date(),
  };

  const mockAutoApplyPreference: AutoApplyPreference = {
    id: '1',
    userId: 'user-1',
    isEnabled: true,
    jobTypes: [JobType.FULL_TIME, JobType.CONTRACT],
    jobLevels: [JobLevel.JUNIOR, JobLevel.MID_LEVEL],
    jobLocations: [JobLocation.REMOTE, JobLocation.HYBRID],
    keywords: ['javascript', 'react', 'node.js'],
    excludeKeywords: ['php', 'wordpress'],
    locations: ['São Paulo', 'Rio de Janeiro'],
    minSalary: 5000,
    defaultResumeId: 'resume-1',
    defaultCoverLetterId: 'cover-letter-1',
    dailyLimit: 20,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AutoApplyService,
        {
          provide: getRepositoryToken(AutoApplyHistory),
          useValue: mockAutoApplyHistoryRepository,
        },
        {
          provide: getRepositoryToken(AutoApplyPreference),
          useValue: mockAutoApplyPreferenceRepository,
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: DocumentsService,
          useValue: mockDocumentsService,
        },
        {
          provide: JobsService,
          useValue: mockJobsService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    autoApplyService = module.get<AutoApplyService>(AutoApplyService);
    autoApplyHistoryRepository = module.get<Repository<AutoApplyHistory>>(
      getRepositoryToken(AutoApplyHistory),
    );
    autoApplyPreferenceRepository = module.get<Repository<AutoApplyPreference>>(
      getRepositoryToken(AutoApplyPreference),
    );
    usersService = module.get<UsersService>(UsersService);
    documentsService = module.get<DocumentsService>(DocumentsService);
    jobsService = module.get<JobsService>(JobsService);

    // Reset mocks
    jest.clearAllMocks();
    
    // Default mock implementations
    mockConfigService.get.mockImplementation((key: string) => {
      const config = {
        'autoApply.dailyLimits.basic': 10,
        'autoApply.dailyLimits.plus': 30,
        'autoApply.dailyLimits.premium': 100,
      };
      return config[key];
    });
    
    mockUsersService.getUserSubscriptionTier.mockResolvedValue(UserSubscriptionTier.PLUS);
  });

  describe('getPreferences', () => {
    it('should return user preferences if they exist', async () => {
      // Arrange
      const userId = 'user-1';
      mockAutoApplyPreferenceRepository.findOne.mockResolvedValue(mockAutoApplyPreference);

      // Act
      const result = await autoApplyService.getPreferences(userId);

      // Assert
      expect(result).toEqual(mockAutoApplyPreference);
      expect(mockAutoApplyPreferenceRepository.findOne).toHaveBeenCalledWith({
        where: { userId },
      });
    });

    it('should create default preferences if they do not exist', async () => {
      // Arrange
      const userId = 'user-1';
      mockAutoApplyPreferenceRepository.findOne.mockResolvedValue(null);
      mockAutoApplyPreferenceRepository.create.mockReturnValue({
        userId,
        isEnabled: false,
        jobTypes: [JobType.FULL_TIME],
        jobLevels: [JobLevel.ENTRY, JobLevel.JUNIOR, JobLevel.MID_LEVEL],
        jobLocations: [JobLocation.REMOTE, JobLocation.HYBRID, JobLocation.ON_SITE],
        keywords: [],
        excludeKeywords: [],
        locations: [],
        minSalary: 0,
        dailyLimit: 30,
      });
      mockAutoApplyPreferenceRepository.save.mockResolvedValue({
        id: '1',
        userId,
        isEnabled: false,
        jobTypes: [JobType.FULL_TIME],
        jobLevels: [JobLevel.ENTRY, JobLevel.JUNIOR, JobLevel.MID_LEVEL],
        jobLocations: [JobLocation.REMOTE, JobLocation.HYBRID, JobLocation.ON_SITE],
        keywords: [],
        excludeKeywords: [],
        locations: [],
        minSalary: 0,
        dailyLimit: 30,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
      
      mockDocumentsService.getDefaultResume.mockResolvedValue({ id: 'resume-1' });
      mockDocumentsService.getDefaultCoverLetter.mockResolvedValue({ id: 'cover-letter-1' });

      // Act
      const result = await autoApplyService.getPreferences(userId);

      // Assert
      expect(result).toEqual({
        id: '1',
        userId,
        isEnabled: false,
        jobTypes: [JobType.FULL_TIME],
        jobLevels: [JobLevel.ENTRY, JobLevel.JUNIOR, JobLevel.MID_LEVEL],
        jobLocations: [JobLocation.REMOTE, JobLocation.HYBRID, JobLocation.ON_SITE],
        keywords: [],
        excludeKeywords: [],
        locations: [],
        minSalary: 0,
        dailyLimit: 30,
        defaultResumeId: 'resume-1',
        defaultCoverLetterId: 'cover-letter-1',
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
      expect(mockAutoApplyPreferenceRepository.findOne).toHaveBeenCalledWith({
        where: { userId },
      });
      expect(mockAutoApplyPreferenceRepository.create).toHaveBeenCalled();
      expect(mockAutoApplyPreferenceRepository.save).toHaveBeenCalled();
      expect(mockDocumentsService.getDefaultResume).toHaveBeenCalledWith(userId);
      expect(mockDocumentsService.getDefaultCoverLetter).toHaveBeenCalledWith(userId);
    });
  });

  describe('updatePreferences', () => {
    it('should update user preferences', async () => {
      // Arrange
      const userId = 'user-1';
      const updateData = {
        isEnabled: true,
        jobTypes: [JobType.FULL_TIME, JobType.CONTRACT],
        jobLevels: [JobLevel.JUNIOR, JobLevel.MID_LEVEL],
        keywords: ['javascript', 'react', 'node.js'],
        locations: ['São Paulo'],
        minSalary: 5000,
        defaultResumeId: 'resume-2',
      };
      
      mockAutoApplyPreferenceRepository.findOne.mockResolvedValue(mockAutoApplyPreference);
      mockAutoApplyPreferenceRepository.save.mockResolvedValue({
        ...mockAutoApplyPreference,
        ...updateData,
        updatedAt: expect.any(Date),
      });
      
      mockDocumentsService.findById.mockResolvedValue({ id: 'resume-2', userId });

      // Act
      const result = await autoApplyService.updatePreferences(userId, updateData);

      // Assert
      expect(result).toEqual({
        ...mockAutoApplyPreference,
        ...updateData,
        updatedAt: expect.any(Date),
      });
      expect(mockAutoApplyPreferenceRepository.findOne).toHaveBeenCalledWith({
        where: { userId },
      });
      expect(mockDocumentsService.findById).toHaveBeenCalledWith('resume-2');
      expect(mockAutoApplyPreferenceRepository.save).toHaveBeenCalledWith({
        ...mockAutoApplyPreference,
        ...updateData,
        updatedAt: expect.any(Date),
      });
    });

    it('should throw BadRequestException if resume does not belong to user', async () => {
      // Arrange
      const userId = 'user-1';
      const updateData = {
        defaultResumeId: 'resume-2',
      };
      
      mockAutoApplyPreferenceRepository.findOne.mockResolvedValue(mockAutoApplyPreference);
      mockDocumentsService.findById.mockResolvedValue({ id: 'resume-2', userId: 'other-user' });

      // Act & Assert
      await expect(autoApplyService.updatePreferences(userId, updateData)).rejects.toThrow(
        BadRequestException,
      );
      expect(mockAutoApplyPreferenceRepository.findOne).toHaveBeenCalledWith({
        where: { userId },
      });
      expect(mockDocumentsService.findById).toHaveBeenCalledWith('resume-2');
      expect(mockAutoApplyPreferenceRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('getHistory', () => {
    it('should return application history with pagination', async () => {
      // Arrange
      const userId = 'user-1';
      const limit = 10;
      const page = 1;
      
      const mockQueryBuilder = mockAutoApplyHistoryRepository.createQueryBuilder();
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[mockAutoApplyHistory], 1]);

      // Act
      const result = await autoApplyService.getHistory(userId, limit, page);

      // Assert
      expect(result).toEqual({
        items: [mockAutoApplyHistory],
        total: 1,
        page: 1,
        limit: 10,
        pages: 1,
      });
      expect(mockAutoApplyHistoryRepository.createQueryBuilder).toHaveBeenCalled();
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('history.userId = :userId', { userId });
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('history.createdAt', 'DESC');
      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(0);
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(10);
      expect(mockQueryBuilder.getManyAndCount).toHaveBeenCalled();
    });
  });

  describe('applyToJob', () => {
    it('should create an application history record', async () => {
      // Arrange
      const userId = 'user-1';
      const jobId = 'job-1';
      const coverLetter = 'Custom cover letter';
      const resumeId = 'resume-1';
      
      const mockJob = {
        id: jobId,
        title: 'Software Engineer',
        companyName: 'Tech Company',
        applicationUrl: 'https://www.linkedin.com/jobs/view/job-1',
        status: JobStatus.ACTIVE,
      };
      
      mockJobsService.findOne.mockResolvedValue(mockJob);
      mockDocumentsService.findById.mockResolvedValue({ id: resumeId, userId });
      
      mockAutoApplyHistoryRepository.create.mockReturnValue({
        userId,
        jobId,
        status: AutoApplyStatus.PENDING,
        platform: 'LINKEDIN',
        applicationUrl: mockJob.applicationUrl,
        resumeId,
        coverLetter,
      });
      
      mockAutoApplyHistoryRepository.save.mockResolvedValue({
        id: '1',
        userId,
        jobId,
        status: AutoApplyStatus.PENDING,
        platform: 'LINKEDIN',
        applicationUrl: mockJob.applicationUrl,
        resumeId,
        coverLetter,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });

      // Act
      const result = await autoApplyService.applyToJob(userId, jobId, coverLetter, resumeId);

      // Assert
      expect(result).toEqual({
        id: '1',
        userId,
        jobId,
        status: AutoApplyStatus.PENDING,
        platform: 'LINKEDIN',
        applicationUrl: mockJob.applicationUrl,
        resumeId,
        coverLetter,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
      expect(mockJobsService.findOne).toHaveBeenCalledWith(jobId);
      expect(mockDocumentsService.findById).toHaveBeenCalledWith(resumeId);
      expect(mockAutoApplyHistoryRepository.create).toHaveBeenCalled();
      expect(mockAutoApplyHistoryRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if job not found', async () => {
      // Arrange
      const userId = 'user-1';
      const jobId = 'job-999';
      
      mockJobsService.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(autoApplyService.applyToJob(userId, jobId)).rejects.toThrow(NotFoundException);
      expect(mockJobsService.findOne).toHaveBeenCalledWith(jobId);
      expect(mockAutoApplyHistoryRepository.create).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if job is not active', async () => {
      // Arrange
      const userId = 'user-1';
      const jobId = 'job-1';
      
      const mockJob = {
        id: jobId,
        title: 'Software Engineer',
        companyName: 'Tech Company',
        applicationUrl: 'https://www.linkedin.com/jobs/view/job-1',
        status: JobStatus.EXPIRED,
      };
      
      mockJobsService.findOne.mockResolvedValue(mockJob);

      // Act & Assert
      await expect(autoApplyService.applyToJob(userId, jobId)).rejects.toThrow(BadRequestException);
      expect(mockJobsService.findOne).toHaveBeenCalledWith(jobId);
      expect(mockAutoApplyHistoryRepository.create).not.toHaveBeenCalled();
    });
  });
});
