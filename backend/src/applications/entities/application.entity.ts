import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { Job } from '../../jobs/entities/job.entity';

export enum ApplicationStatus {
  PENDING = 'pending',
  REVIEWING = 'reviewing',
  INTERVIEW = 'interview',
  OFFER = 'offer',
  REJECTED = 'rejected',
  ACCEPTED = 'accepted',
  WITHDRAWN = 'withdrawn',
}

export enum ApplicationSource {
  MANUAL = 'manual',
  AUTO_APPLY = 'auto_apply',
  LINKEDIN = 'linkedin',
  INFOJOBS = 'infojobs',
  CATHO = 'catho',
}

@Entity('applications')
export class Application extends BaseEntity {
  @ApiProperty({ description: 'Application status' })
  @Column({
    type: 'enum',
    enum: ApplicationStatus,
    default: ApplicationStatus.PENDING,
  })
  status: ApplicationStatus;

  @ApiProperty({ description: 'Application source' })
  @Column({
    type: 'enum',
    enum: ApplicationSource,
    default: ApplicationSource.MANUAL,
  })
  source: ApplicationSource;

  @ApiProperty({ description: 'Cover letter text' })
  @Column({ type: 'text', nullable: true })
  coverLetter: string;

  @ApiProperty({ description: 'Path to resume document' })
  @Column({ nullable: true })
  resumePath: string;

  @ApiProperty({ description: 'Answers to application questions' })
  @Column({ type: 'jsonb', nullable: true })
  answers: Record<string, string>;

  @ApiProperty({ description: 'Match score between candidate and job' })
  @Column({ nullable: true })
  matchScore: number;

  @ApiProperty({ description: 'Notes from the candidate' })
  @Column({ type: 'text', nullable: true })
  candidateNotes: string;

  @ApiProperty({ description: 'Notes from the company' })
  @Column({ type: 'text', nullable: true })
  companyNotes: string;

  @ApiProperty({ description: 'External application ID (for auto-apply)' })
  @Column({ nullable: true })
  externalApplicationId: string;

  @ApiProperty({ description: 'External application URL' })
  @Column({ nullable: true })
  externalApplicationUrl: string;

  // Relationships
  @ManyToOne(() => User, user => user.applications)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @ManyToOne(() => Job, job => job.applications)
  @JoinColumn({ name: 'jobId' })
  job: Job;

  @Column()
  jobId: string;
}
