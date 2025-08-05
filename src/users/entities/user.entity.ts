import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';

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
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @Column({ unique: true })
  email: string;

  @Column()
  fullName: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  location: string;

  @Column({ nullable: true })
  title: string;

  @Column({ nullable: true })
  experience: number;

  @Column({ nullable: true, type: 'text' })
  skills: string;

  @Column({ nullable: true, type: 'text' })
  bio: string;

  @Column({ nullable: true })
  profileImage: string;

  @Column({ nullable: true })
  portfolioUrl: string;

  @Column({ nullable: true })
  linkedinUrl: string;

  @Column({ nullable: true })
  githubUrl: string;

  @Column({ nullable: true, type: 'text' })
  jobTypes: string;

  @Column({ nullable: true, type: 'text' })
  workModels: string;

  @Column({ nullable: true })
  salaryExpectationMin: number;

  @Column({ nullable: true })
  salaryExpectationMax: number;

  @Column({ nullable: true, type: 'text' })
  industries: string;

  @Column({ nullable: true, type: 'text' })
  locations: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.CANDIDATE,
  })
  role: UserRole;

  @Column({
    type: 'enum',
    enum: SubscriptionPlan,
    default: SubscriptionPlan.BASIC,
  })
  subscriptionPlan: SubscriptionPlan;

  @Column({ default: 10 })
  credits: number;

  @Column({ default: false })
  autoApplyEnabled: boolean;

  @Column({ default: true })
  emailNotificationsEnabled: boolean;

  @Column({ default: true })
  pushNotificationsEnabled: boolean;

  @Column({ default: true })
  profileVisible: boolean;

  @Column({ nullable: true })
  stripeCustomerId: string;

  @Column({ nullable: true })
  stripeSubscriptionId: string;

  @Column({ nullable: true })
  refreshToken: string;

  @Column({ nullable: true })
  passwordResetToken: string;
}
