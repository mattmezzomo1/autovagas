import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { CareerGoal } from './career-goal.entity';
import { RoadmapStage } from './roadmap-stage.entity';

export enum RoadmapStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  ARCHIVED = 'archived',
}

export enum RoadmapType {
  AI_GENERATED = 'ai_generated',
  CUSTOM = 'custom',
  TEMPLATE = 'template',
}

@Entity('roadmaps')
export class Roadmap extends BaseEntity {
  @ApiProperty({ description: 'Roadmap title' })
  @Column()
  title: string;

  @ApiProperty({ description: 'Detailed description of the roadmap' })
  @Column({ type: 'text' })
  description: string;

  @ApiProperty({ description: 'Type of roadmap' })
  @Column({
    type: 'enum',
    enum: RoadmapType,
    default: RoadmapType.AI_GENERATED,
  })
  type: RoadmapType;

  @ApiProperty({ description: 'Current status of the roadmap' })
  @Column({
    type: 'enum',
    enum: RoadmapStatus,
    default: RoadmapStatus.DRAFT,
  })
  status: RoadmapStatus;

  @ApiProperty({ description: 'Overall progress percentage (0-100)' })
  @Column({ default: 0 })
  progressPercentage: number;

  @ApiProperty({ description: 'Estimated duration in months' })
  @Column()
  estimatedDurationMonths: number;

  @ApiProperty({ description: 'AI-generated insights and recommendations' })
  @Column({ type: 'text', nullable: true })
  aiInsights: string;

  @ApiProperty({ description: 'Key skills that will be developed' })
  @Column('simple-array', { nullable: true })
  keySkills: string[];

  @ApiProperty({ description: 'Expected outcomes upon completion' })
  @Column('simple-array', { nullable: true })
  expectedOutcomes: string[];

  @ApiProperty({ description: 'Difficulty level (1-5)' })
  @Column({ default: 3 })
  difficultyLevel: number;

  @ApiProperty({ description: 'Whether this roadmap is public/shareable' })
  @Column({ default: false })
  isPublic: boolean;

  @ApiProperty({ description: 'Tags for categorization' })
  @Column('simple-array', { nullable: true })
  tags: string[];

  @ApiProperty({ description: 'Date when the roadmap was started' })
  @Column({ nullable: true })
  startedAt: Date;

  @ApiProperty({ description: 'Date when the roadmap was completed' })
  @Column({ nullable: true })
  completedAt: Date;

  // Relationships
  @ManyToOne(() => User, user => user.roadmaps)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @ManyToOne(() => CareerGoal, careerGoal => careerGoal.roadmaps, { nullable: true })
  @JoinColumn({ name: 'careerGoalId' })
  careerGoal: CareerGoal;

  @Column({ nullable: true })
  careerGoalId: string;

  @OneToMany(() => RoadmapStage, stage => stage.roadmap, { cascade: true })
  stages: RoadmapStage[];
}
