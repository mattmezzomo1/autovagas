import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lesson, LessonType, LessonStatus } from '../entities/lesson.entity';
import { Module } from '../entities/module.entity';

export interface CreateLessonDto {
  title: string;
  description: string;
  type: LessonType;
  order: number;
  estimatedDurationMinutes: number;
  videoUrl?: string;
  videoDurationSeconds?: number;
  textContent?: string;
  interactiveContent?: string;
  learningObjectives?: string[];
  keyTakeaways?: string[];
  resources?: string;
  thumbnailUrl?: string;
  isPremium?: boolean;
  passingScore?: number;
  isRequired?: boolean;
  transcript?: string;
}

@Injectable()
export class LessonsService {
  constructor(
    @InjectRepository(Lesson)
    private lessonRepository: Repository<Lesson>,
    @InjectRepository(Module)
    private moduleRepository: Repository<Module>,
  ) {}

  async create(moduleId: string, createLessonDto: CreateLessonDto): Promise<Lesson> {
    const module = await this.moduleRepository.findOne({
      where: { id: moduleId },
    });

    if (!module) {
      throw new NotFoundException(`Module with ID ${moduleId} not found`);
    }

    const lesson = this.lessonRepository.create({
      ...createLessonDto,
      moduleId,
    });

    return this.lessonRepository.save(lesson);
  }

  async findAllByModule(moduleId: string): Promise<Lesson[]> {
    return this.lessonRepository.find({
      where: { moduleId },
      relations: ['assessments'],
      order: { order: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Lesson> {
    const lesson = await this.lessonRepository.findOne({
      where: { id },
      relations: ['module', 'module.course', 'assessments', 'userProgress'],
    });

    if (!lesson) {
      throw new NotFoundException(`Lesson with ID ${id} not found`);
    }

    return lesson;
  }

  async update(id: string, updateData: Partial<CreateLessonDto>): Promise<Lesson> {
    const lesson = await this.findOne(id);
    
    Object.assign(lesson, updateData);
    
    return this.lessonRepository.save(lesson);
  }

  async updateStatus(id: string, status: LessonStatus): Promise<Lesson> {
    const lesson = await this.findOne(id);
    
    lesson.status = status;
    
    return this.lessonRepository.save(lesson);
  }

  async remove(id: string): Promise<void> {
    const lesson = await this.findOne(id);
    await this.lessonRepository.softDelete(id);
  }

  async getLessonProgress(lessonId: string, userId: string): Promise<any> {
    const lesson = await this.findOne(lessonId);
    
    // This would typically query UserProgress for this specific lesson
    // For now, return a basic structure
    return {
      lessonId,
      status: 'not_started',
      progressPercentage: 0,
      timeSpent: 0,
      videoPosition: 0,
      lastAccessedAt: null,
      completedAt: null,
    };
  }

  async markAsCompleted(lessonId: string, userId: string): Promise<void> {
    // This would create/update a UserProgress record
    // Implementation would involve the UserProgress entity
  }

  async updateVideoProgress(lessonId: string, userId: string, position: number): Promise<void> {
    // This would update the video position in UserProgress
    // Implementation would involve the UserProgress entity
  }

  async reorderLessons(moduleId: string, lessonOrders: { id: string; order: number }[]): Promise<void> {
    for (const { id, order } of lessonOrders) {
      await this.lessonRepository.update(id, { order });
    }
  }

  async getNextLesson(currentLessonId: string): Promise<Lesson | null> {
    const currentLesson = await this.findOne(currentLessonId);
    
    return this.lessonRepository.findOne({
      where: {
        moduleId: currentLesson.moduleId,
        order: currentLesson.order + 1,
      },
    });
  }

  async getPreviousLesson(currentLessonId: string): Promise<Lesson | null> {
    const currentLesson = await this.findOne(currentLessonId);
    
    return this.lessonRepository.findOne({
      where: {
        moduleId: currentLesson.moduleId,
        order: currentLesson.order - 1,
      },
    });
  }
}
