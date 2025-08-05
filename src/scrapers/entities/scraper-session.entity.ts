import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum ScraperPlatform {
  LINKEDIN = 'LINKEDIN',
  INFOJOBS = 'INFOJOBS',
  CATHO = 'CATHO',
  INDEED = 'INDEED',
}

export enum SessionStatus {
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  INVALID = 'INVALID',
  RATE_LIMITED = 'RATE_LIMITED',
}

@Entity('scraper_sessions')
export class ScraperSession {
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
    enum: SessionStatus,
    default: SessionStatus.ACTIVE,
  })
  status: SessionStatus;

  @Column({ type: 'jsonb' })
  cookies: any;

  @Column({ nullable: true, type: 'jsonb' })
  headers: any;

  @Column({ nullable: true })
  userAgent: string;

  @Column({ nullable: true })
  proxyUrl: string;

  @Column({ default: 0 })
  requestCount: number;

  @Column({ nullable: true })
  lastRequestAt: Date;

  @Column({ nullable: true })
  expiresAt: Date;

  @Column({ nullable: true, type: 'text' })
  errorMessage: string;

  @Column({ default: false })
  isClientSide: boolean;
}
