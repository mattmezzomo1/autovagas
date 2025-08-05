import { Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Application, ApplicationStatus } from '../entities/application.entity';
import { Job } from '../entities/job.entity';
import { User, UserRole } from '../../users/entities/user.entity';
import { CreateApplicationDto } from '../dto/create-application.dto';
import { UpdateApplicationStatusDto } from '../dto/update-application-status.dto';
import { JobsService } from './jobs.service';

@Injectable()
export class ApplicationsService {
  constructor(
    @InjectRepository(Application)
    private applicationsRepository: Repository<Application>,
    @InjectRepository(Job)
    private jobsRepository: Repository<Job>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jobsService: JobsService,
  ) {}

  async apply(userId: string, createApplicationDto: CreateApplicationDto): Promise<Application> {
    const { jobId, coverLetter, resumeUrl } = createApplicationDto;

    // Check if user is a candidate
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user || user.role !== UserRole.CANDIDATE) {
      throw new ForbiddenException('Apenas candidatos podem se candidatar a vagas');
    }

    // Check if job exists and is active
    const job = await this.jobsRepository.findOne({ where: { id: jobId, isActive: true } });
    if (!job) {
      throw new NotFoundException(`Vaga com ID ${jobId} não encontrada ou não está ativa`);
    }

    // Check if user has already applied to this job
    const existingApplication = await this.applicationsRepository.findOne({
      where: { userId, jobId },
    });

    if (existingApplication) {
      throw new ConflictException('Você já se candidatou a esta vaga');
    }

    // Create application
    const application = this.applicationsRepository.create({
      userId,
      jobId,
      coverLetter,
      resumeUrl,
      status: ApplicationStatus.PENDING,
    });

    // Increment application count for the job
    await this.jobsService.incrementApplicationCount(jobId);

    return this.applicationsRepository.save(application);
  }

  async findUserApplications(userId: string, page: number = 1, limit: number = 10): Promise<any> {
    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute query
    const [applications, total] = await this.applicationsRepository.findAndCount({
      where: { userId },
      relations: ['job'],
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrevious = page > 1;

    return {
      data: applications,
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

  async findJobApplications(jobId: string, userId: string, page: number = 1, limit: number = 10): Promise<any> {
    // Check if job exists
    const job = await this.jobsRepository.findOne({ where: { id: jobId } });
    if (!job) {
      throw new NotFoundException(`Vaga com ID ${jobId} não encontrada`);
    }

    // Check if user is the owner of the job
    if (job.companyUserId !== userId) {
      throw new ForbiddenException('Você não tem permissão para ver candidaturas desta vaga');
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute query
    const [applications, total] = await this.applicationsRepository.findAndCount({
      where: { jobId },
      relations: ['user'],
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrevious = page > 1;

    return {
      data: applications,
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

  async findOne(id: string): Promise<Application> {
    const application = await this.applicationsRepository.findOne({
      where: { id },
      relations: ['job', 'user'],
    });

    if (!application) {
      throw new NotFoundException(`Candidatura com ID ${id} não encontrada`);
    }

    return application;
  }

  async updateStatus(id: string, userId: string, updateStatusDto: UpdateApplicationStatusDto): Promise<Application> {
    const application = await this.findOne(id);

    // Check if user is the owner of the job
    if (application.job.companyUserId !== userId) {
      throw new ForbiddenException('Você não tem permissão para atualizar esta candidatura');
    }

    // Update application status
    application.status = updateStatusDto.status;
    if (updateStatusDto.notes) {
      application.notes = updateStatusDto.notes;
    }

    return this.applicationsRepository.save(application);
  }

  async markAsRead(id: string, userId: string): Promise<Application> {
    const application = await this.findOne(id);

    // Check if user is the owner of the job
    if (application.job.companyUserId !== userId) {
      throw new ForbiddenException('Você não tem permissão para atualizar esta candidatura');
    }

    // Mark as read
    application.isRead = true;

    return this.applicationsRepository.save(application);
  }

  async withdraw(id: string, userId: string): Promise<void> {
    const application = await this.findOne(id);

    // Check if user is the owner of the application
    if (application.userId !== userId) {
      throw new ForbiddenException('Você não tem permissão para retirar esta candidatura');
    }

    // Remove application
    await this.applicationsRepository.remove(application);
  }

  async getApplicationStatistics(userId: string): Promise<any> {
    // Check if user is a candidate
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user || user.role !== UserRole.CANDIDATE) {
      throw new ForbiddenException('Apenas candidatos podem ver estatísticas de candidaturas');
    }

    // Get all applications for the user
    const applications = await this.applicationsRepository.find({
      where: { userId },
      relations: ['job'],
    });

    // Calculate statistics
    const totalApplications = applications.length;
    const statusCounts = {
      [ApplicationStatus.PENDING]: 0,
      [ApplicationStatus.REVIEWING]: 0,
      [ApplicationStatus.INTERVIEW]: 0,
      [ApplicationStatus.REJECTED]: 0,
      [ApplicationStatus.ACCEPTED]: 0,
    };

    applications.forEach(app => {
      statusCounts[app.status]++;
    });

    return {
      totalApplications,
      statusCounts,
      interviewRate: totalApplications > 0 ? (statusCounts[ApplicationStatus.INTERVIEW] / totalApplications) * 100 : 0,
      acceptanceRate: totalApplications > 0 ? (statusCounts[ApplicationStatus.ACCEPTED] / totalApplications) * 100 : 0,
      rejectionRate: totalApplications > 0 ? (statusCounts[ApplicationStatus.REJECTED] / totalApplications) * 100 : 0,
    };
  }
}
