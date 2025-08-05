import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { Application } from '../../applications/entities/application.entity';

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
export class Job extends BaseEntity {
  @ApiProperty({ description: 'Job title' })
  @Column()
  title: string;

  @ApiProperty({ description: 'Job description' })
  @Column({ type: 'text' })
  description: string;

  @ApiProperty({ description: 'Company name' })
  @Column()
  companyName: string;

  @ApiProperty({ description: 'Job location' })
  @Column()
  location: string;

  @ApiProperty({ description: 'Job type (CLT, PJ, etc.)' })
  @Column({
    type: 'enum',
    enum: JobType,
    default: JobType.CLT,
  })
  jobType: JobType;

  @ApiProperty({ description: 'Work model (onsite, remote, hybrid)' })
  @Column({
    type: 'enum',
    enum: WorkModel,
    default: WorkModel.ONSITE,
  })
  workModel: WorkModel;

  @ApiProperty({ description: 'Minimum salary' })
  @Column({ nullable: true })
  salaryMin: number;

  @ApiProperty({ description: 'Maximum salary' })
  @Column({ nullable: true })
  salaryMax: number;

  @ApiProperty({ description: 'Whether to display salary information' })
  @Column({ default: true })
  displaySalary: boolean;

  @ApiProperty({ description: 'Required skills for the job' })
  @Column('simple-array')
  skills: string[];

  @ApiProperty({ description: 'Job requirements' })
  @Column('simple-array')
  requirements: string[];

  @ApiProperty({ description: 'Job benefits' })
  @Column('simple-array', { nullable: true })
  benefits: string[];

  @ApiProperty({ description: 'Industry the job belongs to' })
  @Column()
  industry: string;

  @ApiProperty({ description: 'Work hours per week' })
  @Column({ nullable: true })
  workHours: number;

  @ApiProperty({ description: 'Experience level required (in years)' })
  @Column({ nullable: true })
  experienceYears: number;

  @ApiProperty({ description: 'Date when the job posting expires' })
  @Column({ type: 'timestamp' })
  expiresAt: Date;

  @ApiProperty({ description: 'Whether the job is active' })
  @Column({ default: true })
  isActive: boolean;

  @ApiProperty({ description: 'Number of vacancies available' })
  @Column({ default: 1 })
  vacancies: number;

  // Relationships
  @ManyToOne(() => User, user => user.jobs)
  @JoinColumn({ name: 'companyUserId' })
  company: User;

  @Column()
  companyUserId: string;

  @OneToMany(() => Application, application => application.job)
  applications: Application[];
}
