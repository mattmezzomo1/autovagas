import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { Roadmap } from './roadmap.entity';

export enum CareerGoalStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  PAUSED = 'paused',
  CANCELLED = 'cancelled',
}

export enum CareerGoalTimeframe {
  SHORT_TERM = 'short_term', // 1-2 anos
  MEDIUM_TERM = 'medium_term', // 3-5 anos
  LONG_TERM = 'long_term', // 5+ anos
}

@Entity('career_goals')
export class CareerGoal extends BaseEntity {
  @ApiProperty({ description: 'Career goal title' })
  @Column()
  title: string;

  @ApiProperty({ description: 'Detailed description of the career goal' })
  @Column({ type: 'text' })
  description: string;

  @ApiProperty({ description: 'Target position or role' })
  @Column()
  targetPosition: string;

  @ApiProperty({ description: 'Target company type or specific company' })
  @Column({ nullable: true })
  targetCompany: string;

  @ApiProperty({ description: 'Target industry' })
  @Column()
  targetIndustry: string;

  @ApiProperty({ description: 'Target salary range minimum' })
  @Column({ nullable: true })
  targetSalaryMin: number;

  @ApiProperty({ description: 'Target salary range maximum' })
  @Column({ nullable: true })
  targetSalaryMax: number;

  @ApiProperty({ description: 'Expected timeframe to achieve the goal' })
  @Column({
    type: 'enum',
    enum: CareerGoalTimeframe,
    default: CareerGoalTimeframe.MEDIUM_TERM,
  })
  timeframe: CareerGoalTimeframe;

  @ApiProperty({ description: 'Current status of the career goal' })
  @Column({
    type: 'enum',
    enum: CareerGoalStatus,
    default: CareerGoalStatus.ACTIVE,
  })
  status: CareerGoalStatus;

  @ApiProperty({ description: 'Priority level (1-5, where 5 is highest)' })
  @Column({ default: 3 })
  priority: number;

  @ApiProperty({ description: 'Progress percentage (0-100)' })
  @Column({ default: 0 })
  progressPercentage: number;

  @ApiProperty({ description: 'Skills required to achieve this goal' })
  @Column('simple-array', { nullable: true })
  requiredSkills: string[];

  @ApiProperty({ description: 'Additional notes or context' })
  @Column({ type: 'text', nullable: true })
  notes: string;

  // Relationships
  @ManyToOne(() => User, user => user.careerGoals)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @OneToMany(() => Roadmap, roadmap => roadmap.careerGoal)
  roadmaps: Roadmap[];
}
