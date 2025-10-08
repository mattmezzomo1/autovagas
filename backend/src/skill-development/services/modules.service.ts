import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Module, ModuleStatus } from '../entities/module.entity';
import { Course } from '../../courses/entities/course.entity';

export interface CreateModuleDto {
  title: string;
  description: string;
  order: number;
  estimatedDurationMinutes: number;
  learningObjectives?: string[];
  prerequisites?: string[];
  skillsCovered?: string[];
  thumbnailUrl?: string;
  isPremium?: boolean;
  resources?: string;
  summary?: string;
}

@Injectable()
export class ModulesService {
  constructor(
    @InjectRepository(Module)
    private moduleRepository: Repository<Module>,
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
  ) {}

  async create(courseId: string, createModuleDto: CreateModuleDto): Promise<Module> {
    const course = await this.courseRepository.findOne({
      where: { id: courseId },
    });

    if (!course) {
      throw new NotFoundException(`Course with ID ${courseId} not found`);
    }

    const module = this.moduleRepository.create({
      ...createModuleDto,
      courseId,
    });

    return this.moduleRepository.save(module);
  }

  async findAllByCourse(courseId: string): Promise<Module[]> {
    return this.moduleRepository.find({
      where: { courseId },
      relations: ['lessons'],
      order: { order: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Module> {
    const module = await this.moduleRepository.findOne({
      where: { id },
      relations: ['course', 'lessons', 'lessons.assessments'],
    });

    if (!module) {
      throw new NotFoundException(`Module with ID ${id} not found`);
    }

    return module;
  }

  async update(id: string, updateData: Partial<CreateModuleDto>): Promise<Module> {
    const module = await this.findOne(id);
    
    Object.assign(module, updateData);
    
    return this.moduleRepository.save(module);
  }

  async updateStatus(id: string, status: ModuleStatus): Promise<Module> {
    const module = await this.findOne(id);
    
    module.status = status;
    
    return this.moduleRepository.save(module);
  }

  async remove(id: string): Promise<void> {
    const module = await this.findOne(id);
    await this.moduleRepository.softDelete(id);
  }

  async getModuleProgress(moduleId: string, userId: string): Promise<any> {
    const module = await this.findOne(moduleId);
    
    // This would typically involve querying UserProgress
    // For now, return a basic structure
    return {
      moduleId,
      totalLessons: module.lessons.length,
      completedLessons: 0, // Would be calculated from UserProgress
      progressPercentage: 0,
      timeSpent: 0,
    };
  }

  async reorderModules(courseId: string, moduleOrders: { id: string; order: number }[]): Promise<void> {
    for (const { id, order } of moduleOrders) {
      await this.moduleRepository.update(id, { order });
    }
  }
}
