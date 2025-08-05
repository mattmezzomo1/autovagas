import { Entity, Column, OneToMany, OneToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { BaseEntity } from '../../common/entities/base.entity';
import { Document } from '../../documents/entities/document.entity';
import { Application } from '../../applications/entities/application.entity';
import { Job } from '../../jobs/entities/job.entity';
import { AutoApplyConfig } from '../../auto-apply/entities/auto-apply-config.entity';
import { Company } from '../../companies/entities/company.entity';

export enum UserRole {
  CANDIDATE = 'candidate',
  COMPANY = 'company',
  ADMIN = 'admin',
}

export enum SubscriptionPlan {
  BASIC = 'basic',
  PLUS = 'plus',
  PREMIUM = 'premium',
}

@Entity('users')
export class User extends BaseEntity {
  @ApiProperty({ description: 'User email address' })
  @Column({ unique: true })
  email: string;

  @ApiProperty({ description: 'User full name' })
  @Column()
  fullName: string;

  @Exclude()
  @Column()
  password: string;

  @ApiProperty({ description: 'User phone number' })
  @Column({ nullable: true })
  phone: string;

  @ApiProperty({ description: 'User location' })
  @Column({ nullable: true })
  location: string;

  @ApiProperty({ description: 'User professional title' })
  @Column({ nullable: true })
  title: string;

  @ApiProperty({ description: 'Years of professional experience' })
  @Column({ nullable: true })
  experience: number;

  @ApiProperty({ description: 'User skills' })
  @Column('simple-array', { nullable: true })
  skills: string[];

  @ApiProperty({ description: 'User bio or professional summary' })
  @Column({ type: 'text', nullable: true })
  bio: string;

  @ApiProperty({ description: 'URL to user profile image' })
  @Column({ nullable: true })
  profileImage: string;

  @ApiProperty({ description: 'URL to user portfolio' })
  @Column({ nullable: true })
  portfolioUrl: string;

  @ApiProperty({ description: 'URL to user LinkedIn profile' })
  @Column({ nullable: true })
  linkedinUrl: string;

  @ApiProperty({ description: 'URL to user GitHub profile' })
  @Column({ nullable: true })
  githubUrl: string;

  @ApiProperty({ description: 'Types of jobs the user is interested in' })
  @Column('simple-array', { nullable: true })
  jobTypes: string[];

  @ApiProperty({ description: 'Work models the user is interested in' })
  @Column('simple-array', { nullable: true })
  workModels: string[];

  @ApiProperty({ description: 'Minimum salary expectation' })
  @Column({ nullable: true })
  salaryExpectationMin: number;

  @ApiProperty({ description: 'Maximum salary expectation' })
  @Column({ nullable: true })
  salaryExpectationMax: number;

  @ApiProperty({ description: 'Industries the user is interested in' })
  @Column('simple-array', { nullable: true })
  industries: string[];

  @ApiProperty({ description: 'Locations the user is interested in' })
  @Column('simple-array', { nullable: true })
  locations: string[];

  @ApiProperty({ description: 'User role' })
  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.CANDIDATE,
  })
  role: UserRole;

  @ApiProperty({ description: 'User subscription plan' })
  @Column({
    type: 'enum',
    enum: SubscriptionPlan,
    default: SubscriptionPlan.BASIC,
  })
  subscriptionPlan: SubscriptionPlan;

  @ApiProperty({ description: 'Number of AI credits available' })
  @Column({ default: 10 })
  credits: number;

  @ApiProperty({ description: 'Whether auto-apply is enabled' })
  @Column({ default: false })
  autoApplyEnabled: boolean;

  @ApiProperty({ description: 'Stripe customer ID' })
  @Column({ nullable: true })
  stripeCustomerId: string;

  @ApiProperty({ description: 'Stripe subscription ID' })
  @Column({ nullable: true })
  stripeSubscriptionId: string;

  @ApiProperty({ description: 'Refresh token for JWT authentication' })
  @Column({ nullable: true })
  @Exclude()
  refreshToken: string;

  // Relationships
  @OneToMany(() => Document, document => document.user)
  documents: Document[];

  @OneToMany(() => Application, application => application.user)
  applications: Application[];

  @OneToMany(() => Job, job => job.company)
  jobs: Job[];

  @OneToOne(() => AutoApplyConfig, config => config.user, { cascade: true })
  autoApplyConfig: AutoApplyConfig;

  @OneToOne(() => Company, company => company.user, { cascade: true })
  company: Company;
}
