import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JobsService } from './jobs.service';
import { Job, JobStatus, JobType, JobLevel, JobLocation } from '../entities/job.entity';
import { CreateJobDto } from '../dto/create-job.dto';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

describe('JobsService', () => {
  let jobsService: JobsService;
  let jobRepository: Repository<Job>;

  const mockJobRepository = {
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
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn(),
      getOne: jest.fn(),
    })),
  };

  const mockJob: Job = {
    id: '1',
    title: 'Software Engineer',
    description: 'Job description',
    companyName: 'Tech Company',
    type: JobType.FULL_TIME,
    level: JobLevel.MID_LEVEL,
    locationType: JobLocation.REMOTE,
    status: JobStatus.ACTIVE,
    userId: 'user-1',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JobsService,
        {
          provide: getRepositoryToken(Job),
          useValue: mockJobRepository,
        },
      ],
    }).compile();

    jobsService = module.get<JobsService>(JobsService);
    jobRepository = module.get<Repository<Job>>(getRepositoryToken(Job));

    // Reset mocks
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new job', async () => {
      // Arrange
      const createJobDto: CreateJobDto = {
        title: 'Software Engineer',
        description: 'Job description',
        companyName: 'Tech Company',
        type: JobType.FULL_TIME,
        level: JobLevel.MID_LEVEL,
        locationType: JobLocation.REMOTE,
      };

      const userId = 'user-1';

      mockJobRepository.create.mockReturnValue({ ...createJobDto, userId });
      mockJobRepository.save.mockResolvedValue({
        id: '1',
        ...createJobDto,
        userId,
        status: JobStatus.ACTIVE,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });

      // Act
      const result = await jobsService.create(createJobDto, userId);

      // Assert
      expect(result).toEqual({
        id: '1',
        ...createJobDto,
        userId,
        status: JobStatus.ACTIVE,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });

      expect(jobRepository.create).toHaveBeenCalledWith({
        ...createJobDto,
        userId,
      });
      expect(jobRepository.save).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return jobs with pagination', async () => {
      // Arrange
      const mockQueryBuilder = jobRepository.createQueryBuilder();
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[mockJob], 1]);

      // Act
      const result = await jobsService.findAll({
        page: 1,
        limit: 10,
        status: JobStatus.ACTIVE,
      });

      // Assert
      expect(result).toEqual({
        items: [mockJob],
        total: 1,
        page: 1,
        limit: 10,
        pages: 1,
      });

      expect(jobRepository.createQueryBuilder).toHaveBeenCalled();
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('job.status = :status', {
        status: JobStatus.ACTIVE,
      });
      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(0);
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(10);
      expect(mockQueryBuilder.getManyAndCount).toHaveBeenCalled();
    });

    it('should apply filters correctly', async () => {
      // Arrange
      const mockQueryBuilder = jobRepository.createQueryBuilder();
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[mockJob], 1]);

      // Act
      const result = await jobsService.findAll({
        page: 1,
        limit: 10,
        status: JobStatus.ACTIVE,
        type: JobType.FULL_TIME,
        level: JobLevel.MID_LEVEL,
        locationType: JobLocation.REMOTE,
        query: 'engineer',
      });

      // Assert
      expect(result).toEqual({
        items: [mockJob],
        total: 1,
        page: 1,
        limit: 10,
        pages: 1,
      });

      expect(jobRepository.createQueryBuilder).toHaveBeenCalled();
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('job.status = :status', {
        status: JobStatus.ACTIVE,
      });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('job.type = :type', {
        type: JobType.FULL_TIME,
      });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('job.level = :level', {
        level: JobLevel.MID_LEVEL,
      });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('job.locationType = :locationType', {
        locationType: JobLocation.REMOTE,
      });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        '(job.title ILIKE :query OR job.description ILIKE :query OR job.companyName ILIKE :query)',
        { query: '%engineer%' },
      );
    });
  });

  describe('findOne', () => {
    it('should return a job by id', async () => {
      // Arrange
      mockJobRepository.findOne.mockResolvedValue(mockJob);

      // Act
      const result = await jobsService.findOne('1');

      // Assert
      expect(result).toEqual(mockJob);
      expect(jobRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('should throw NotFoundException if job not found', async () => {
      // Arrange
      mockJobRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(jobsService.findOne('999')).rejects.toThrow(NotFoundException);
      expect(jobRepository.findOne).toHaveBeenCalledWith({
        where: { id: '999' },
      });
    });
  });

  describe('update', () => {
    it('should update a job', async () => {
      // Arrange
      const updateJobDto = {
        title: 'Updated Job Title',
      };

      mockJobRepository.findOne.mockResolvedValue(mockJob);
      mockJobRepository.save.mockResolvedValue({
        ...mockJob,
        title: 'Updated Job Title',
        updatedAt: expect.any(Date),
      });

      // Act
      const result = await jobsService.update('1', updateJobDto, 'user-1');

      // Assert
      expect(result).toEqual({
        ...mockJob,
        title: 'Updated Job Title',
        updatedAt: expect.any(Date),
      });
      expect(jobRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(jobRepository.save).toHaveBeenCalledWith({
        ...mockJob,
        title: 'Updated Job Title',
        updatedAt: expect.any(Date),
      });
    });

    it('should throw NotFoundException if job not found', async () => {
      // Arrange
      const updateJobDto = {
        title: 'Updated Job Title',
      };

      mockJobRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(jobsService.update('999', updateJobDto, 'user-1')).rejects.toThrow(
        NotFoundException,
      );
      expect(jobRepository.findOne).toHaveBeenCalledWith({
        where: { id: '999' },
      });
      expect(jobRepository.save).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException if user is not the owner', async () => {
      // Arrange
      const updateJobDto = {
        title: 'Updated Job Title',
      };

      mockJobRepository.findOne.mockResolvedValue(mockJob);

      // Act & Assert
      await expect(jobsService.update('1', updateJobDto, 'different-user')).rejects.toThrow(
        ForbiddenException,
      );
      expect(jobRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(jobRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should remove a job', async () => {
      // Arrange
      mockJobRepository.findOne.mockResolvedValue(mockJob);
      mockJobRepository.delete.mockResolvedValue({ affected: 1 });

      // Act
      await jobsService.remove('1', 'user-1');

      // Assert
      expect(jobRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(jobRepository.delete).toHaveBeenCalledWith('1');
    });

    it('should throw NotFoundException if job not found', async () => {
      // Arrange
      mockJobRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(jobsService.remove('999', 'user-1')).rejects.toThrow(NotFoundException);
      expect(jobRepository.findOne).toHaveBeenCalledWith({
        where: { id: '999' },
      });
      expect(jobRepository.delete).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException if user is not the owner', async () => {
      // Arrange
      mockJobRepository.findOne.mockResolvedValue(mockJob);

      // Act & Assert
      await expect(jobsService.remove('1', 'different-user')).rejects.toThrow(ForbiddenException);
      expect(jobRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(jobRepository.delete).not.toHaveBeenCalled();
    });
  });
});
