import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, In, Not } from 'typeorm';
import { Job, JobType, WorkModel } from './entities/job.entity';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { SearchJobsDto } from './dto/search-jobs.dto';
import { UserRole } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { paginate, IPaginationOptions, Pagination } from 'nestjs-typeorm-paginate';

@Injectable()
export class JobsService {
  constructor(
    @InjectRepository(Job)
    private jobsRepository: Repository<Job>,
    private usersService: UsersService,
  ) {}

  async create(userId: string, createJobDto: CreateJobDto): Promise<Job> {
    // Verify user is a company
    const user = await this.usersService.findById(userId);
    if (user.role !== UserRole.COMPANY) {
      throw new ForbiddenException('Only companies can create job listings');
    }

    // Set expiration date (default to 30 days from now if not provided)
    const expiresAt = createJobDto.expiresAt
      ? new Date(createJobDto.expiresAt)
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    // Create job
    const job = this.jobsRepository.create({
      ...createJobDto,
      companyUserId: userId,
      expiresAt,
    });

    return this.jobsRepository.save(job);
  }

  async findAll(options: IPaginationOptions, searchParams?: SearchJobsDto): Promise<Pagination<Job>> {
    const queryBuilder = this.jobsRepository.createQueryBuilder('job');

    // Only show active jobs
    queryBuilder.where('job.isActive = :isActive', { isActive: true });

    // Add search filters if provided
    if (searchParams) {
      if (searchParams.title) {
        queryBuilder.andWhere('job.title ILIKE :title', { title: `%${searchParams.title}%` });
      }

      if (searchParams.location) {
        queryBuilder.andWhere('job.location ILIKE :location', { location: `%${searchParams.location}%` });
      }

      if (searchParams.jobTypes && searchParams.jobTypes.length > 0) {
        queryBuilder.andWhere('job.jobType IN (:...jobTypes)', { jobTypes: searchParams.jobTypes });
      }

      if (searchParams.workModels && searchParams.workModels.length > 0) {
        queryBuilder.andWhere('job.workModel IN (:...workModels)', { workModels: searchParams.workModels });
      }

      if (searchParams.salaryMin) {
        queryBuilder.andWhere('job.salaryMin >= :salaryMin', { salaryMin: searchParams.salaryMin });
      }

      if (searchParams.industry) {
        queryBuilder.andWhere('job.industry ILIKE :industry', { industry: `%${searchParams.industry}%` });
      }

      if (searchParams.skills && searchParams.skills.length > 0) {
        // Search for jobs that contain any of the skills
        const skillConditions = searchParams.skills.map((skill, index) => {
          const param = `skill${index}`;
          queryBuilder.orWhere(`job.skills ILIKE :${param}`, { [param]: `%${skill}%` });
          return param;
        });
      }
    }

    // Order by creation date (newest first)
    queryBuilder.orderBy('job.createdAt', 'DESC');

    return paginate<Job>(queryBuilder, options);
  }

  async findAllByCompany(companyUserId: string): Promise<Job[]> {
    return this.jobsRepository.find({
      where: { companyUserId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Job> {
    const job = await this.jobsRepository.findOne({
      where: { id },
      relations: ['company'],
    });

    if (!job) {
      throw new NotFoundException(`Job with ID ${id} not found`);
    }

    return job;
  }

  async update(id: string, userId: string, updateJobDto: UpdateJobDto): Promise<Job> {
    const job = await this.findOne(id);

    // Check if user is the owner of the job
    if (job.companyUserId !== userId) {
      throw new ForbiddenException('You do not have permission to update this job');
    }

    // Update job properties
    Object.assign(job, updateJobDto);

    // Update expiration date if provided
    if (updateJobDto.expiresAt) {
      job.expiresAt = new Date(updateJobDto.expiresAt);
    }

    return this.jobsRepository.save(job);
  }

  async remove(id: string, userId: string): Promise<void> {
    const job = await this.findOne(id);

    // Check if user is the owner of the job
    if (job.companyUserId !== userId) {
      throw new ForbiddenException('You do not have permission to delete this job');
    }

    await this.jobsRepository.softDelete(id);
  }

  async toggleActive(id: string, userId: string, isActive: boolean): Promise<Job> {
    const job = await this.findOne(id);

    // Check if user is the owner of the job
    if (job.companyUserId !== userId) {
      throw new ForbiddenException('You do not have permission to update this job');
    }

    job.isActive = isActive;

    return this.jobsRepository.save(job);
  }

  async getSimilarJobs(id: string): Promise<Job[]> {
    const job = await this.findOne(id);

    // Find jobs with similar skills, industry, or job type
    return this.jobsRepository.find({
      where: [
        { industry: job.industry, id: Not(job.id) },
        { jobType: job.jobType, id: Not(job.id) },
      ],
      take: 5,
      order: { createdAt: 'DESC' },
    });
  }
}
