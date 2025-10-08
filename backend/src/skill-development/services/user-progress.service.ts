import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserProgress, ProgressStatus } from '../entities/user-progress.entity';
import { Course } from '../../courses/entities/course.entity';
import { Module } from '../entities/module.entity';
import { Lesson } from '../entities/lesson.entity';
import { Assessment } from '../entities/assessment.entity';
import { Action } from '../entities/action.entity';

export interface UpdateProgressDto {
  status?: ProgressStatus;
  progressPercentage?: number;
  timeSpentMinutes?: number;
  score?: number;
  maxScore?: number;
  videoPosition?: number;
  userAnswers?: string;
  feedback?: string;
  metadata?: string;
}

@Injectable()
export class UserProgressService {
  constructor(
    @InjectRepository(UserProgress)
    private progressRepository: Repository<UserProgress>,
  ) {}

  async createOrUpdateCourseProgress(
    userId: string,
    courseId: string,
    updateData: UpdateProgressDto,
  ): Promise<UserProgress> {
    let progress = await this.progressRepository.findOne({
      where: { userId, courseId },
    });

    if (!progress) {
      progress = this.progressRepository.create({
        userId,
        courseId,
        status: ProgressStatus.NOT_STARTED,
        progressPercentage: 0,
        timeSpentMinutes: 0,
        attempts: 0,
      });
    }

    Object.assign(progress, updateData);

    if (updateData.status === ProgressStatus.IN_PROGRESS && !progress.startedAt) {
      progress.startedAt = new Date();
    }

    if (updateData.status === ProgressStatus.COMPLETED && !progress.completedAt) {
      progress.completedAt = new Date();
      progress.progressPercentage = 100;
    }

    progress.lastAccessedAt = new Date();

    return this.progressRepository.save(progress);
  }

  async createOrUpdateLessonProgress(
    userId: string,
    lessonId: string,
    updateData: UpdateProgressDto,
  ): Promise<UserProgress> {
    let progress = await this.progressRepository.findOne({
      where: { userId, lessonId },
    });

    if (!progress) {
      progress = this.progressRepository.create({
        userId,
        lessonId,
        status: ProgressStatus.NOT_STARTED,
        progressPercentage: 0,
        timeSpentMinutes: 0,
        attempts: 0,
      });
    }

    Object.assign(progress, updateData);

    if (updateData.status === ProgressStatus.IN_PROGRESS && !progress.startedAt) {
      progress.startedAt = new Date();
    }

    if (updateData.status === ProgressStatus.COMPLETED && !progress.completedAt) {
      progress.completedAt = new Date();
      progress.progressPercentage = 100;
    }

    progress.lastAccessedAt = new Date();

    return this.progressRepository.save(progress);
  }

  async createOrUpdateAssessmentProgress(
    userId: string,
    assessmentId: string,
    updateData: UpdateProgressDto,
  ): Promise<UserProgress> {
    let progress = await this.progressRepository.findOne({
      where: { userId, assessmentId },
    });

    if (!progress) {
      progress = this.progressRepository.create({
        userId,
        assessmentId,
        status: ProgressStatus.NOT_STARTED,
        progressPercentage: 0,
        timeSpentMinutes: 0,
        attempts: 0,
      });
    }

    // Increment attempts for assessments
    if (updateData.status === ProgressStatus.COMPLETED) {
      progress.attempts += 1;
    }

    Object.assign(progress, updateData);

    if (updateData.status === ProgressStatus.IN_PROGRESS && !progress.startedAt) {
      progress.startedAt = new Date();
    }

    if (updateData.status === ProgressStatus.COMPLETED && !progress.completedAt) {
      progress.completedAt = new Date();
    }

    progress.lastAccessedAt = new Date();

    return this.progressRepository.save(progress);
  }

  async createOrUpdateActionProgress(
    userId: string,
    actionId: string,
    updateData: UpdateProgressDto,
  ): Promise<UserProgress> {
    let progress = await this.progressRepository.findOne({
      where: { userId, actionId },
    });

    if (!progress) {
      progress = this.progressRepository.create({
        userId,
        actionId,
        status: ProgressStatus.NOT_STARTED,
        progressPercentage: 0,
        timeSpentMinutes: 0,
        attempts: 0,
      });
    }

    Object.assign(progress, updateData);

    if (updateData.status === ProgressStatus.IN_PROGRESS && !progress.startedAt) {
      progress.startedAt = new Date();
    }

    if (updateData.status === ProgressStatus.COMPLETED && !progress.completedAt) {
      progress.completedAt = new Date();
      progress.progressPercentage = 100;
    }

    progress.lastAccessedAt = new Date();

    return this.progressRepository.save(progress);
  }

  async getUserCourseProgress(userId: string, courseId: string): Promise<UserProgress | null> {
    return this.progressRepository.findOne({
      where: { userId, courseId },
      relations: ['course'],
    });
  }

  async getUserLessonProgress(userId: string, lessonId: string): Promise<UserProgress | null> {
    return this.progressRepository.findOne({
      where: { userId, lessonId },
      relations: ['lesson'],
    });
  }

  async getUserProgressByCourse(userId: string, courseId: string): Promise<UserProgress[]> {
    return this.progressRepository.find({
      where: { userId, courseId },
      relations: ['course', 'module', 'lesson', 'assessment'],
    });
  }

  async calculateCourseProgress(userId: string, courseId: string): Promise<number> {
    // This would calculate overall course progress based on completed lessons/modules
    const allProgress = await this.getUserProgressByCourse(userId, courseId);
    
    if (allProgress.length === 0) return 0;
    
    const completedItems = allProgress.filter(p => p.status === ProgressStatus.COMPLETED).length;
    return Math.round((completedItems / allProgress.length) * 100);
  }

  async getUserStats(userId: string): Promise<any> {
    const allProgress = await this.progressRepository.find({
      where: { userId },
    });

    const totalCourses = new Set(allProgress.filter(p => p.courseId).map(p => p.courseId)).size;
    const completedCourses = allProgress.filter(p => 
      p.courseId && p.status === ProgressStatus.COMPLETED
    ).length;

    const totalLessons = allProgress.filter(p => p.lessonId).length;
    const completedLessons = allProgress.filter(p => 
      p.lessonId && p.status === ProgressStatus.COMPLETED
    ).length;

    const totalTimeSpent = allProgress.reduce((sum, p) => sum + p.timeSpentMinutes, 0);

    return {
      totalCourses,
      completedCourses,
      totalLessons,
      completedLessons,
      totalTimeSpentMinutes: totalTimeSpent,
      totalTimeSpentHours: Math.round(totalTimeSpent / 60 * 10) / 10,
    };
  }
}
