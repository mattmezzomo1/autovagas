import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { ScraperPlatform } from './scraper-session.entity';

export enum ScraperJobStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

@Entity('scraper_jobs')
export class ScraperJob {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column()
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({
    type: 'enum',
    enum: ScraperPlatform,
  })
  platform: ScraperPlatform;

  @Column({
    type: 'enum',
    enum: ScraperJobStatus,
    default: ScraperJobStatus.PENDING,
  })
  status: ScraperJobStatus;

  @Column({ type: 'jsonb' })
  parameters: any;

  @Column({ nullable: true, type: 'jsonb' })
  result: any;

  @Column({ nullable: true, type: 'text' })
  errorMessage: string;

  @Column({ nullable: true })
  startedAt: Date;

  @Column({ nullable: true })
  completedAt: Date;

  @Column({ default: 0 })
  retryCount: number;

  @Column({ nullable: true })
  nextRetryAt: Date;

  @Column({ default: false })
  isAutoApply: boolean;
}
