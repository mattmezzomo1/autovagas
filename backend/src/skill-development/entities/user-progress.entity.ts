import { Entity, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { Course } from '../../courses/entities/course.entity';
import { Module } from './module.entity';
import { Lesson } from './lesson.entity';
import { Assessment } from './assessment.entity';
import { Action } from './action.entity';

export enum ProgressStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
  SKIPPED = 'skipped',
}

@Entity('user_progress')
@Unique(['userId', 'courseId', 'moduleId', 'lessonId', 'assessmentId', 'actionId'])
export class UserProgress extends BaseEntity {
  @ApiProperty({ description: 'Progress status' })
  @Column({
    type: 'enum',
    enum: ProgressStatus,
    default: ProgressStatus.NOT_STARTED,
  })
  status: ProgressStatus;

  @ApiProperty({ description: 'Progress percentage (0-100)' })
  @Column({ default: 0 })
  progressPercentage: number;

  @ApiProperty({ description: 'Time spent in minutes' })
  @Column({ default: 0 })
  timeSpentMinutes: number;

  @ApiProperty({ description: 'Score achieved (for assessments)' })
  @Column({ nullable: true })
  score: number;

  @ApiProperty({ description: 'Maximum score possible (for assessments)' })
  @Column({ nullable: true })
  maxScore: number;

  @ApiProperty({ description: 'Number of attempts made' })
  @Column({ default: 0 })
  attempts: number;

  @ApiProperty({ description: 'Date when started' })
  @Column({ nullable: true })
  startedAt: Date;

  @ApiProperty({ description: 'Date when completed' })
  @Column({ nullable: true })
  completedAt: Date;

  @ApiProperty({ description: 'Last accessed date' })
  @Column({ nullable: true })
  lastAccessedAt: Date;

  @ApiProperty({ description: 'Current position in video (seconds)' })
  @Column({ nullable: true })
  videoPosition: number;

  @ApiProperty({ description: 'User answers for assessments (JSON)' })
  @Column({ type: 'text', nullable: true })
  userAnswers: string;

  @ApiProperty({ description: 'Feedback or notes' })
  @Column({ type: 'text', nullable: true })
  feedback: string;

  @ApiProperty({ description: 'Additional metadata (JSON)' })
  @Column({ type: 'text', nullable: true })
  metadata: string;

  // Relationships
  @ManyToOne(() => User, user => user.progress)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @ManyToOne(() => Course, { nullable: true })
  @JoinColumn({ name: 'courseId' })
  course: Course;

  @Column({ nullable: true })
  courseId: string;

  @ManyToOne(() => Module, { nullable: true })
  @JoinColumn({ name: 'moduleId' })
  module: Module;

  @Column({ nullable: true })
  moduleId: string;

  @ManyToOne(() => Lesson, lesson => lesson.userProgress, { nullable: true })
  @JoinColumn({ name: 'lessonId' })
  lesson: Lesson;

  @Column({ nullable: true })
  lessonId: string;

  @ManyToOne(() => Assessment, assessment => assessment.userProgress, { nullable: true })
  @JoinColumn({ name: 'assessmentId' })
  assessment: Assessment;

  @Column({ nullable: true })
  assessmentId: string;

  @ManyToOne(() => Action, action => action.userProgress, { nullable: true })
  @JoinColumn({ name: 'actionId' })
  action: Action;

  @Column({ nullable: true })
  actionId: string;
}
