import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('platform_connections')
@Index(['userId', 'platform'], { unique: true })
export class PlatformConnection {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @Index()
  userId: string;

  @Column({ type: 'varchar', length: 50 })
  @Index()
  platform: string;

  @Column({ type: 'jsonb' })
  credentials: {
    username?: string;
    password?: string;
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: Date;
    email?: string;
    sessionToken?: string;
    [key: string]: any;
  };

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'timestamp', nullable: true })
  connectedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastUsed: Date;

  @Column({ type: 'timestamp', nullable: true })
  disconnectedAt: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    userAgent?: string;
    ipAddress?: string;
    deviceInfo?: string;
    loginAttempts?: number;
    lastError?: string;
    [key: string]: any;
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
