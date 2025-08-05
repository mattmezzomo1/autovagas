import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum JobType {
  CLT = 'CLT',
  PJ = 'PJ',
  FREELANCER = 'FREELANCER',
  INTERNSHIP = 'INTERNSHIP',
  TEMPORARY = 'TEMPORARY',
}

export enum WorkModel {
  ONSITE = 'ONSITE',
  REMOTE = 'REMOTE',
  HYBRID = 'HYBRID',
}

@Entity('jobs')
export class Job {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column()
  companyName: string;

  @Column()
  location: string;

  @Column({
    type: 'enum',
    enum: JobType,
    default: JobType.CLT,
  })
  jobType: JobType;

  @Column({
    type: 'enum',
    enum: WorkModel,
    default: WorkModel.ONSITE,
  })
  workModel: WorkModel;

  @Column({ nullable: true })
  salaryMin: number;

  @Column({ nullable: true })
  salaryMax: number;

  @Column({ default: true })
  displaySalary: boolean;

  @Column('text')
  skills: string;

  @Column('text')
  requirements: string;

  @Column('text', { nullable: true })
  benefits: string;

  @Column()
  industry: string;

  @Column({ nullable: true })
  workHours: number;

  @Column({ nullable: true })
  experienceYears: number;

  @Column()
  expiresAt: Date;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: 1 })
  vacancies: number;

  @Column()
  companyUserId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'companyUserId' })
  companyUser: User;

  // Statistics fields
  @Column({ default: 0 })
  viewCount: number;

  @Column({ default: 0 })
  applicationCount: number;

  @Column({ default: 0 })
  impressionCount: number;

  @Column({ default: 0 })
  clickCount: number;

  @Column({ default: 0 })
  saveCount: number;
}
