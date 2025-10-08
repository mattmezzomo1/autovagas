import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../common/entities/base.entity';
import { RoadmapStage } from './roadmap-stage.entity';
import { Course } from '../../courses/entities/course.entity';
import { UserProgress } from './user-progress.entity';

export enum ActionType {
  COURSE = 'course',
  CERTIFICATION = 'certification',
  PROJECT = 'project',
  EXPERIENCE = 'experience',
  NETWORKING = 'networking',
  SKILL_PRACTICE = 'skill_practice',
  JOB_APPLICATION = 'job_application',
  MENTORSHIP = 'mentorship',
  READING = 'reading',
  WORKSHOP = 'workshop',
  CONFERENCE = 'conference',
}

export enum ActionStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  SKIPPED = 'skipped',
}

export enum ActionPriority {
  LOW = 1,
  MEDIUM = 2,
  HIGH = 3,
  CRITICAL = 4,
}

@Entity('actions')
export class Action extends BaseEntity {
  @ApiProperty({ description: 'Action title' })
  @Column()
  title: string;

  @ApiProperty({ description: 'Detailed description of the action' })
  @Column({ type: 'text' })
  description: string;

  @ApiProperty({ description: 'Type of action' })
  @Column({
    type: 'enum',
    enum: ActionType,
  })
  type: ActionType;

  @ApiProperty({ description: 'Current status of the action' })
  @Column({
    type: 'enum',
    enum: ActionStatus,
    default: ActionStatus.NOT_STARTED,
  })
  status: ActionStatus;

  @ApiProperty({ description: 'Priority level of the action' })
  @Column({
    type: 'enum',
    enum: ActionPriority,
    default: ActionPriority.MEDIUM,
  })
  priority: ActionPriority;

  @ApiProperty({ description: 'Estimated time to complete (in hours)' })
  @Column({ nullable: true })
  estimatedHours: number;

  @ApiProperty({ description: 'Skills that will be developed' })
  @Column('simple-array', { nullable: true })
  skillsToLearn: string[];

  @ApiProperty({ description: 'External URL or resource link' })
  @Column({ nullable: true })
  resourceUrl: string;

  @ApiProperty({ description: 'Cost associated with this action' })
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  cost: number;

  @ApiProperty({ description: 'Currency for the cost' })
  @Column({ default: 'BRL' })
  currency: string;

  @ApiProperty({ description: 'Expected outcomes from completing this action' })
  @Column('simple-array', { nullable: true })
  expectedOutcomes: string[];

  @ApiProperty({ description: 'Success criteria for completion' })
  @Column('simple-array', { nullable: true })
  successCriteria: string[];

  @ApiProperty({ description: 'Due date for completion' })
  @Column({ nullable: true })
  dueDate: Date;

  @ApiProperty({ description: 'Date when the action was started' })
  @Column({ nullable: true })
  startedAt: Date;

  @ApiProperty({ description: 'Date when the action was completed' })
  @Column({ nullable: true })
  completedAt: Date;

  @ApiProperty({ description: 'Additional notes or instructions' })
  @Column({ type: 'text', nullable: true })
  notes: string;

  @ApiProperty({ description: 'Order within the stage' })
  @Column({ default: 0 })
  order: number;

  // Relationships
  @ManyToOne(() => RoadmapStage, stage => stage.actions)
  @JoinColumn({ name: 'stageId' })
  stage: RoadmapStage;

  @Column()
  stageId: string;

  @ManyToOne(() => Course, { nullable: true })
  @JoinColumn({ name: 'courseId' })
  course: Course;

  @Column({ nullable: true })
  courseId: string;

  @OneToMany(() => UserProgress, progress => progress.action)
  userProgress: UserProgress[];
}
