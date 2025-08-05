import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Application, ApplicationStatus, ApplicationSource } from './entities/application.entity';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationStatusDto } from './dto/update-application-status.dto';
import { JobsService } from '../jobs/jobs.service';
import { UsersService } from '../users/users.service';
import { DocumentsService } from '../documents/documents.service';
import { AiService } from '../ai/ai.service';
import { UserRole } from '../users/entities/user.entity';

@Injectable()
export class ApplicationsService {
  constructor(
    @InjectRepository(Application)
    private applicationsRepository: Repository<Application>,
    private jobsService: JobsService,
    private usersService: UsersService,
    private documentsService: DocumentsService,
    private aiService: AiService,
  ) {}

  async create(userId: string, createApplicationDto: CreateApplicationDto): Promise<Application> {
    // Check if job exists
    const job = await this.jobsService.findOne(createApplicationDto.jobId);
    
    // Check if user has already applied to this job
    const existingApplication = await this.applicationsRepository.findOne({
      where: {
        userId,
        jobId: job.id,
      },
    });
    
    if (existingApplication) {
      throw new BadRequestException('You have already applied to this job');
    }
    
    // Get user to calculate match score
    const user = await this.usersService.findById(userId);
    
    // Calculate match score using AI
    const matchScore = await this.aiService.analyzeJobMatch(
      {
        id: job.id,
        platform: 'manual',
        title: job.title,
        company: job.companyName,
        location: job.location,
        requirements: job.requirements,
      },
      user,
    );
    
    // Create application
    const application = this.applicationsRepository.create({
      userId,
      jobId: job.id,
      status: ApplicationStatus.PENDING,
      source: ApplicationSource.MANUAL,
      coverLetter: createApplicationDto.coverLetter,
      resumePath: createApplicationDto.resumePath,
      answers: createApplicationDto.answers,
      matchScore,
      candidateNotes: createApplicationDto.candidateNotes,
    });
    
    return this.applicationsRepository.save(application);
  }

  async findAll(userId: string): Promise<Application[]> {
    return this.applicationsRepository.find({
      where: { userId },
      relations: ['job'],
      order: { createdAt: 'DESC' },
    });
  }

  async findAllForJob(jobId: string, companyUserId: string): Promise<Application[]> {
    // Check if job exists and belongs to the company
    const job = await this.jobsService.findOne(jobId);
    
    if (job.companyUserId !== companyUserId) {
      throw new ForbiddenException('You do not have permission to view applications for this job');
    }
    
    return this.applicationsRepository.find({
      where: { jobId },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, userId: string, isCompany: boolean = false): Promise<Application> {
    const application = await this.applicationsRepository.findOne({
      where: { id },
      relations: ['job', 'user'],
    });
    
    if (!application) {
      throw new NotFoundException(`Application with ID ${id} not found`);
    }
    
    // Check permissions
    if (isCompany) {
      // Company user can only view applications for their jobs
      const job = await this.jobsService.findOne(application.jobId);
      if (job.companyUserId !== userId) {
        throw new ForbiddenException('You do not have permission to view this application');
      }
    } else {
      // Regular user can only view their own applications
      if (application.userId !== userId) {
        throw new ForbiddenException('You do not have permission to view this application');
      }
    }
    
    return application;
  }

  async updateStatus(id: string, companyUserId: string, updateStatusDto: UpdateApplicationStatusDto): Promise<Application> {
    const application = await this.applicationsRepository.findOne({
      where: { id },
      relations: ['job'],
    });
    
    if (!application) {
      throw new NotFoundException(`Application with ID ${id} not found`);
    }
    
    // Check if job belongs to the company
    if (application.job.companyUserId !== companyUserId) {
      throw new ForbiddenException('You do not have permission to update this application');
    }
    
    // Update status
    application.status = updateStatusDto.status;
    
    // Add company notes if provided
    if (updateStatusDto.companyNotes) {
      application.companyNotes = updateStatusDto.companyNotes;
    }
    
    return this.applicationsRepository.save(application);
  }

  async withdraw(id: string, userId: string): Promise<Application> {
    const application = await this.applicationsRepository.findOne({
      where: { id, userId },
    });
    
    if (!application) {
      throw new NotFoundException(`Application with ID ${id} not found`);
    }
    
    // Update status to withdrawn
    application.status = ApplicationStatus.WITHDRAWN;
    
    return this.applicationsRepository.save(application);
  }

  async createFromAutoApply(
    userId: string,
    jobId: string,
    platform: string,
    externalApplicationId: string,
    externalApplicationUrl: string,
    matchScore: number,
  ): Promise<Application> {
    // Create application
    const application = this.applicationsRepository.create({
      userId,
      jobId,
      status: ApplicationStatus.PENDING,
      source: platform as ApplicationSource,
      externalApplicationId,
      externalApplicationUrl,
      matchScore,
    });
    
    return this.applicationsRepository.save(application);
  }
}
