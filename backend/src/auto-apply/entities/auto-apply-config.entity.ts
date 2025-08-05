import { Entity, Column, OneToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';

@Entity('auto_apply_configs')
export class AutoApplyConfig extends BaseEntity {
  @ApiProperty({ description: 'Keywords to search for jobs' })
  @Column('simple-array', { nullable: true })
  keywords: string[];

  @ApiProperty({ description: 'Locations to search for jobs' })
  @Column('simple-array')
  locations: string[];

  @ApiProperty({ description: 'Whether to include remote jobs' })
  @Column({ default: true })
  remote: boolean;

  @ApiProperty({ description: 'Job types to search for' })
  @Column('simple-array')
  jobTypes: string[];

  @ApiProperty({ description: 'Work models to search for' })
  @Column('simple-array')
  workModels: string[];

  @ApiProperty({ description: 'Minimum salary to consider' })
  @Column({ nullable: true })
  salaryMin: number;

  @ApiProperty({ description: 'Maximum work hours per week' })
  @Column({ default: 40 })
  workHours: number;

  @ApiProperty({ description: 'Whether to include international jobs' })
  @Column({ default: false })
  internationalJobs: boolean;

  @ApiProperty({ description: 'Experience level to search for' })
  @Column({ nullable: true })
  experienceLevel: string;

  @ApiProperty({ description: 'Industries to search for' })
  @Column('simple-array', { nullable: true })
  industries: string[];

  @ApiProperty({ description: 'Minimum match score to apply automatically' })
  @Column({ default: 70 })
  matchThreshold: number;

  @ApiProperty({ description: 'Maximum applications per day' })
  @Column({ default: 10 })
  maxApplicationsPerDay: number;

  @ApiProperty({ description: 'Run interval in milliseconds' })
  @Column({ default: 3600000 }) // 1 hour
  runInterval: number;

  @ApiProperty({ description: 'Whether to run in headless mode' })
  @Column({ default: true })
  headless: boolean;

  @ApiProperty({ description: 'LinkedIn username' })
  @Column({ nullable: true })
  linkedinUsername: string;

  @ApiProperty({ description: 'LinkedIn password (encrypted)' })
  @Column({ nullable: true })
  linkedinPassword: string;

  @ApiProperty({ description: 'InfoJobs username' })
  @Column({ nullable: true })
  infojobsUsername: string;

  @ApiProperty({ description: 'InfoJobs password (encrypted)' })
  @Column({ nullable: true })
  infojobsPassword: string;

  @ApiProperty({ description: 'Catho username' })
  @Column({ nullable: true })
  cathoUsername: string;

  @ApiProperty({ description: 'Catho password (encrypted)' })
  @Column({ nullable: true })
  cathoPassword: string;

  @ApiProperty({ description: 'Last run date' })
  @Column({ type: 'timestamp', nullable: true })
  lastRunDate: Date;

  @ApiProperty({ description: 'Today\'s application count' })
  @Column({ default: 0 })
  todayApplicationCount: number;

  // Relationships
  @OneToOne(() => User, user => user.autoApplyConfig)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;
}
