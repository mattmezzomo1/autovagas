import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../common/entities/base.entity';
import { Module } from './module.entity';
import { Assessment } from './assessment.entity';
import { UserProgress } from './user-progress.entity';

export enum LessonType {
  VIDEO = 'video',
  TEXT = 'text',
  INTERACTIVE = 'interactive',
  QUIZ = 'quiz',
  ASSIGNMENT = 'assignment',
  LIVE_SESSION = 'live_session',
}

export enum LessonStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

@Entity('lessons')
export class Lesson extends BaseEntity {
  @ApiProperty({ description: 'Lesson title' })
  @Column()
  title: string;

  @ApiProperty({ description: 'Lesson description' })
  @Column({ type: 'text' })
  description: string;

  @ApiProperty({ description: 'Type of lesson content' })
  @Column({
    type: 'enum',
    enum: LessonType,
  })
  type: LessonType;

  @ApiProperty({ description: 'Order of this lesson in the module' })
  @Column()
  order: number;

  @ApiProperty({ description: 'Estimated duration in minutes' })
  @Column()
  estimatedDurationMinutes: number;

  @ApiProperty({ description: 'Lesson status' })
  @Column({
    type: 'enum',
    enum: LessonStatus,
    default: LessonStatus.DRAFT,
  })
  status: LessonStatus;

  @ApiProperty({ description: 'Video URL for video lessons' })
  @Column({ nullable: true })
  videoUrl: string;

  @ApiProperty({ description: 'Video duration in seconds' })
  @Column({ nullable: true })
  videoDurationSeconds: number;

  @ApiProperty({ description: 'Text content for text-based lessons' })
  @Column({ type: 'text', nullable: true })
  textContent: string;

  @ApiProperty({ description: 'Interactive content configuration (JSON)' })
  @Column({ type: 'text', nullable: true })
  interactiveContent: string;

  @ApiProperty({ description: 'Learning objectives for this lesson' })
  @Column('simple-array', { nullable: true })
  learningObjectives: string[];

  @ApiProperty({ description: 'Key takeaways from this lesson' })
  @Column('simple-array', { nullable: true })
  keyTakeaways: string[];

  @ApiProperty({ description: 'Additional resources or links' })
  @Column({ type: 'text', nullable: true })
  resources: string;

  @ApiProperty({ description: 'Lesson thumbnail image URL' })
  @Column({ nullable: true })
  thumbnailUrl: string;

  @ApiProperty({ description: 'Whether this lesson is free or premium' })
  @Column({ default: false })
  isPremium: boolean;

  @ApiProperty({ description: 'Minimum score required to pass (for quizzes)' })
  @Column({ nullable: true })
  passingScore: number;

  @ApiProperty({ description: 'Whether completion is required to proceed' })
  @Column({ default: true })
  isRequired: boolean;

  @ApiProperty({ description: 'Transcript or subtitles for video content' })
  @Column({ type: 'text', nullable: true })
  transcript: string;

  // Relationships
  @ManyToOne(() => Module, module => module.lessons)
  @JoinColumn({ name: 'moduleId' })
  module: Module;

  @Column()
  moduleId: string;

  @OneToMany(() => Assessment, assessment => assessment.lesson)
  assessments: Assessment[];

  @OneToMany(() => UserProgress, progress => progress.lesson)
  userProgress: UserProgress[];
}
