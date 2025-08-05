import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Job } from '../../jobs/entities/job.entity';

export enum AutoApplyStatus {
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  SKIPPED = 'SKIPPED',
}

export enum AutoApplyReason {
  APPLIED = 'APPLIED',
  ALREADY_APPLIED = 'ALREADY_APPLIED',
  LOW_MATCH = 'LOW_MATCH',
  EXCLUDED_KEYWORD = 'EXCLUDED_KEYWORD',
  EXCLUDED_COMPANY = 'EXCLUDED_COMPANY',
  LIMIT_REACHED = 'LIMIT_REACHED',
  ERROR = 'ERROR',
}

@Entity('auto_apply_history')
export class AutoApplyHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column()
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ nullable: true })
  jobId: string;

  @ManyToOne(() => Job, { nullable: true })
  @JoinColumn({ name: 'jobId' })
  job: Job;

  @Column({
    type: 'enum',
    enum: AutoApplyStatus,
    default: AutoApplyStatus.SUCCESS,
  })
  status: AutoApplyStatus;

  @Column({
    type: 'enum',
    enum: AutoApplyReason,
    default: AutoApplyReason.APPLIED,
  })
  reason: AutoApplyReason;

  @Column({ nullable: true })
  matchScore: number;

  @Column({ nullable: true, type: 'text' })
  details: string;

  @Column({ nullable: true })
  applicationId: string;
}
