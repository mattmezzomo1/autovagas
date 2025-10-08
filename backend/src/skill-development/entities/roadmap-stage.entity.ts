import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../common/entities/base.entity';
import { Roadmap } from './roadmap.entity';
import { Action } from './action.entity';

export enum StageStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  SKIPPED = 'skipped',
}

@Entity('roadmap_stages')
export class RoadmapStage extends BaseEntity {
  @ApiProperty({ description: 'Stage title' })
  @Column()
  title: string;

  @ApiProperty({ description: 'Detailed description of the stage' })
  @Column({ type: 'text' })
  description: string;

  @ApiProperty({ description: 'Order of this stage in the roadmap' })
  @Column()
  order: number;

  @ApiProperty({ description: 'Duration range (e.g., "0-2 anos", "2-5 anos")' })
  @Column()
  durationRange: string;

  @ApiProperty({ description: 'Estimated duration in months' })
  @Column()
  estimatedDurationMonths: number;

  @ApiProperty({ description: 'Current status of the stage' })
  @Column({
    type: 'enum',
    enum: StageStatus,
    default: StageStatus.NOT_STARTED,
  })
  status: StageStatus;

  @ApiProperty({ description: 'Progress percentage (0-100)' })
  @Column({ default: 0 })
  progressPercentage: number;

  @ApiProperty({ description: 'Key objectives for this stage' })
  @Column('simple-array', { nullable: true })
  objectives: string[];

  @ApiProperty({ description: 'Skills to be developed in this stage' })
  @Column('simple-array', { nullable: true })
  skillsToLearn: string[];

  @ApiProperty({ description: 'Possible job positions in this stage' })
  @Column('simple-array', { nullable: true })
  possiblePositions: string[];

  @ApiProperty({ description: 'Key milestones to achieve' })
  @Column('simple-array', { nullable: true })
  milestones: string[];

  @ApiProperty({ description: 'Success criteria for completing this stage' })
  @Column('simple-array', { nullable: true })
  successCriteria: string[];

  @ApiProperty({ description: 'Prerequisites before starting this stage' })
  @Column('simple-array', { nullable: true })
  prerequisites: string[];

  @ApiProperty({ description: 'Date when the stage was started' })
  @Column({ nullable: true })
  startedAt: Date;

  @ApiProperty({ description: 'Date when the stage was completed' })
  @Column({ nullable: true })
  completedAt: Date;

  @ApiProperty({ description: 'Additional notes or insights' })
  @Column({ type: 'text', nullable: true })
  notes: string;

  // Relationships
  @ManyToOne(() => Roadmap, roadmap => roadmap.stages)
  @JoinColumn({ name: 'roadmapId' })
  roadmap: Roadmap;

  @Column()
  roadmapId: string;

  @OneToMany(() => Action, action => action.stage, { cascade: true })
  actions: Action[];
}
