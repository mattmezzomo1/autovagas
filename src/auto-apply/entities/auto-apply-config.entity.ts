import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { JobType, WorkModel } from '../../jobs/entities/job.entity';

@Entity('auto_apply_configs')
export class AutoApplyConfig {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column()
  userId: string;

  @OneToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ default: true })
  isEnabled: boolean;

  @Column('text', { nullable: true })
  keywords: string;

  @Column('text', { nullable: true })
  locations: string;

  @Column('text', { nullable: true })
  industries: string;

  @Column('text', { nullable: true })
  excludedKeywords: string;

  @Column('text', { nullable: true })
  excludedCompanies: string;

  @Column({ type: 'simple-array', nullable: true })
  jobTypes: JobType[];

  @Column({ type: 'simple-array', nullable: true })
  workModels: WorkModel[];

  @Column({ nullable: true })
  salaryMin: number;

  @Column({ nullable: true })
  experienceMax: number;

  @Column({ default: 5 })
  matchThreshold: number;

  @Column({ default: 10 })
  maxApplicationsPerDay: number;

  @Column({ default: 50 })
  maxApplicationsPerMonth: number;

  @Column({ default: 0 })
  applicationsToday: number;

  @Column({ default: 0 })
  applicationsThisMonth: number;

  @Column({ type: 'date', nullable: true })
  lastResetDay: Date;

  @Column({ type: 'date', nullable: true })
  lastResetMonth: Date;

  @Column('text', { nullable: true })
  defaultCoverLetter: string;

  @Column({ nullable: true })
  defaultResumeUrl: string;
}
