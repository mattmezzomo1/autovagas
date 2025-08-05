import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, In, Between, LessThanOrEqual, MoreThanOrEqual, FindOptionsWhere } from 'typeorm';
import { Job } from '../entities/job.entity';
import { User, UserRole } from '../../users/entities/user.entity';
import { CreateJobDto } from '../dto/create-job.dto';
import { UpdateJobDto } from '../dto/update-job.dto';
import { SearchJobsDto } from '../dto/search-jobs.dto';

@Injectable()
export class JobsService {
  constructor(
    @InjectRepository(Job)
    private jobsRepository: Repository<Job>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(userId: string, createJobDto: CreateJobDto): Promise<Job> {
    // Check if user is a company
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user || user.role !== UserRole.COMPANY) {
      throw new ForbiddenException('Apenas empresas podem criar vagas');
    }

    // Create job
    const job = this.jobsRepository.create({
      ...createJobDto,
      companyUserId: userId,
    });

    return this.jobsRepository.save(job);
  }

  async findAll(searchJobsDto: SearchJobsDto) {
    const {
      search,
      location,
      jobTypes,
      workModels,
      salaryMin,
      salaryMax,
      skills,
      industry,
      experienceMin,
      experienceMax,
      isActive = true,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortDirection = 'DESC',
    } = searchJobsDto;

    // Build where conditions
    const where: FindOptionsWhere<Job> = {};

    // Active jobs filter
    where.isActive = isActive;

    // Search term
    if (search) {
      where.title = Like(`%${search}%`);
      // Note: This is a simplified approach. For a real implementation,
      // you would use a more sophisticated search mechanism like full-text search
    }

    // Location filter
    if (location) {
      where.location = Like(`%${location}%`);
    }

    // Job types filter
    if (jobTypes && jobTypes.length > 0) {
      where.jobType = In(jobTypes);
    }

    // Work models filter
    if (workModels && workModels.length > 0) {
      where.workModel = In(workModels);
    }

    // Salary range filter
    if (salaryMin !== undefined && salaryMax !== undefined) {
      // Jobs with salary range overlapping the specified range
      where.salaryMin = LessThanOrEqual(salaryMax);
      where.salaryMax = MoreThanOrEqual(salaryMin);
    } else if (salaryMin !== undefined) {
      where.salaryMax = MoreThanOrEqual(salaryMin);
    } else if (salaryMax !== undefined) {
      where.salaryMin = LessThanOrEqual(salaryMax);
    }

    // Skills filter
    if (skills) {
      const skillsArray = skills.split(',').map(skill => skill.trim().toLowerCase());
      // This is a simplified approach. In a real implementation,
      // you would use a more sophisticated matching mechanism
      where.skills = Like(`%${skillsArray[0]}%`);
    }

    // Industry filter
    if (industry) {
      where.industry = Like(`%${industry}%`);
    }

    // Experience range filter
    if (experienceMin !== undefined && experienceMax !== undefined) {
      where.experienceYears = Between(experienceMin, experienceMax);
    } else if (experienceMin !== undefined) {
      where.experienceYears = MoreThanOrEqual(experienceMin);
    } else if (experienceMax !== undefined) {
      where.experienceYears = LessThanOrEqual(experienceMax);
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Validate sort field
    const allowedSortFields = ['createdAt', 'title', 'salaryMin', 'salaryMax', 'experienceYears', 'expiresAt'];
    const validSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';

    // Validate sort direction
    const validSortDirection = sortDirection === 'ASC' ? 'ASC' : 'DESC';

    // Execute query
    const [jobs, total] = await this.jobsRepository.findAndCount({
      where,
      order: { [validSortBy]: validSortDirection },
      skip,
      take: limit,
    });

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrevious = page > 1;

    return {
      data: jobs,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNext,
        hasPrevious,
      },
    };
  }

  async findOne(id: string): Promise<Job> {
    const job = await this.jobsRepository.findOne({ where: { id } });
    
    if (!job) {
      throw new NotFoundException(`Vaga com ID ${id} não encontrada`);
    }
    
    return job;
  }

  async update(id: string, userId: string, updateJobDto: UpdateJobDto): Promise<Job> {
    const job = await this.findOne(id);
    
    // Check if user is the owner of the job
    if (job.companyUserId !== userId) {
      throw new ForbiddenException('Você não tem permissão para editar esta vaga');
    }
    
    // Update job
    await this.jobsRepository.update(id, updateJobDto);
    
    return this.findOne(id);
  }

  async remove(id: string, userId: string): Promise<void> {
    const job = await this.findOne(id);
    
    // Check if user is the owner of the job
    if (job.companyUserId !== userId) {
      throw new ForbiddenException('Você não tem permissão para excluir esta vaga');
    }
    
    // Soft delete job
    await this.jobsRepository.softDelete(id);
  }

  async toggleActive(id: string, userId: string, isActive: boolean): Promise<Job> {
    const job = await this.findOne(id);
    
    // Check if user is the owner of the job
    if (job.companyUserId !== userId) {
      throw new ForbiddenException('Você não tem permissão para alterar esta vaga');
    }
    
    // Update job status
    job.isActive = isActive;
    
    return this.jobsRepository.save(job);
  }

  async incrementViewCount(id: string): Promise<void> {
    await this.jobsRepository.increment({ id }, 'viewCount', 1);
  }

  async incrementApplicationCount(id: string): Promise<void> {
    await this.jobsRepository.increment({ id }, 'applicationCount', 1);
  }

  async incrementImpressionCount(id: string): Promise<void> {
    await this.jobsRepository.increment({ id }, 'impressionCount', 1);
  }

  async incrementClickCount(id: string): Promise<void> {
    await this.jobsRepository.increment({ id }, 'clickCount', 1);
  }

  async incrementSaveCount(id: string): Promise<void> {
    await this.jobsRepository.increment({ id }, 'saveCount', 1);
  }

  async getJobStatistics(id: string, userId: string): Promise<any> {
    const job = await this.findOne(id);
    
    // Check if user is the owner of the job
    if (job.companyUserId !== userId) {
      throw new ForbiddenException('Você não tem permissão para ver estatísticas desta vaga');
    }
    
    return {
      viewCount: job.viewCount,
      applicationCount: job.applicationCount,
      impressionCount: job.impressionCount,
      clickCount: job.clickCount,
      saveCount: job.saveCount,
      clickThroughRate: job.impressionCount > 0 ? (job.clickCount / job.impressionCount) * 100 : 0,
      applicationRate: job.viewCount > 0 ? (job.applicationCount / job.viewCount) * 100 : 0,
    };
  }

  async getCompanyJobs(userId: string, page: number = 1, limit: number = 10): Promise<any> {
    // Check if user is a company
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user || user.role !== UserRole.COMPANY) {
      throw new ForbiddenException('Apenas empresas podem acessar suas vagas');
    }
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Execute query
    const [jobs, total] = await this.jobsRepository.findAndCount({
      where: { companyUserId: userId },
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });
    
    // Calculate pagination metadata
    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrevious = page > 1;
    
    return {
      data: jobs,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNext,
        hasPrevious,
      },
    };
  }

  async getRecommendedJobs(userId: string, limit: number = 10): Promise<Job[]> {
    // Get user
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`Usuário com ID ${userId} não encontrado`);
    }
    
    // This is a simplified recommendation algorithm
    // In a real implementation, you would use a more sophisticated approach
    
    // Get user skills
    const userSkills = user.skills ? user.skills.split(',').map(skill => skill.trim().toLowerCase()) : [];
    
    // Get active jobs
    const jobs = await this.jobsRepository.find({
      where: { isActive: true },
      order: { createdAt: 'DESC' },
    });
    
    // Score jobs based on skill match
    const scoredJobs = jobs.map(job => {
      const jobSkills = job.skills.split(',').map(skill => skill.trim().toLowerCase());
      
      // Count matching skills
      const matchingSkills = userSkills.filter(skill => jobSkills.includes(skill));
      const skillScore = matchingSkills.length / Math.max(userSkills.length, 1);
      
      // Calculate recency score (newer jobs get higher score)
      const ageInDays = (Date.now() - job.createdAt.getTime()) / (1000 * 60 * 60 * 24);
      const recencyScore = Math.max(0, 1 - (ageInDays / 30)); // 0-30 days old
      
      // Calculate final score
      const score = (skillScore * 0.7) + (recencyScore * 0.3);
      
      return { job, score };
    });
    
    // Sort by score and take top N
    scoredJobs.sort((a, b) => b.score - a.score);
    
    return scoredJobs.slice(0, limit).map(item => item.job);
  }
}
