import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { Course } from '../../courses/entities/course.entity';
import { Roadmap } from './roadmap.entity';

export enum CertificateType {
  COURSE_COMPLETION = 'course_completion',
  SKILL_MASTERY = 'skill_mastery',
  ROADMAP_COMPLETION = 'roadmap_completion',
  ASSESSMENT_PASS = 'assessment_pass',
  CUSTOM = 'custom',
}

export enum CertificateStatus {
  PENDING = 'pending',
  ISSUED = 'issued',
  REVOKED = 'revoked',
}

@Entity('certificates')
export class Certificate extends BaseEntity {
  @ApiProperty({ description: 'Certificate title' })
  @Column()
  title: string;

  @ApiProperty({ description: 'Certificate description' })
  @Column({ type: 'text' })
  description: string;

  @ApiProperty({ description: 'Type of certificate' })
  @Column({
    type: 'enum',
    enum: CertificateType,
  })
  type: CertificateType;

  @ApiProperty({ description: 'Certificate status' })
  @Column({
    type: 'enum',
    enum: CertificateStatus,
    default: CertificateStatus.PENDING,
  })
  status: CertificateStatus;

  @ApiProperty({ description: 'Unique certificate number' })
  @Column({ unique: true })
  certificateNumber: string;

  @ApiProperty({ description: 'Skills validated by this certificate' })
  @Column('simple-array', { nullable: true })
  skillsValidated: string[];

  @ApiProperty({ description: 'Date when the certificate was issued' })
  @Column({ nullable: true })
  issuedAt: Date;

  @ApiProperty({ description: 'Date when the certificate expires' })
  @Column({ nullable: true })
  expiresAt: Date;

  @ApiProperty({ description: 'URL to the certificate image/PDF' })
  @Column({ nullable: true })
  certificateUrl: string;

  @ApiProperty({ description: 'URL for certificate verification' })
  @Column({ nullable: true })
  verificationUrl: string;

  @ApiProperty({ description: 'Issuing organization or platform' })
  @Column({ default: 'Autovagas' })
  issuer: string;

  @ApiProperty({ description: 'Score or grade achieved' })
  @Column({ nullable: true })
  score: number;

  @ApiProperty({ description: 'Maximum possible score' })
  @Column({ nullable: true })
  maxScore: number;

  @ApiProperty({ description: 'Additional metadata (JSON)' })
  @Column({ type: 'text', nullable: true })
  metadata: string;

  @ApiProperty({ description: 'Whether the certificate is publicly visible' })
  @Column({ default: true })
  isPublic: boolean;

  @ApiProperty({ description: 'Whether the certificate can be shared' })
  @Column({ default: true })
  isShareable: boolean;

  @ApiProperty({ description: 'Digital signature or hash for verification' })
  @Column({ nullable: true })
  digitalSignature: string;

  // Relationships
  @ManyToOne(() => User, user => user.certificates)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @ManyToOne(() => Course, { nullable: true })
  @JoinColumn({ name: 'courseId' })
  course: Course;

  @Column({ nullable: true })
  courseId: string;

  @ManyToOne(() => Roadmap, { nullable: true })
  @JoinColumn({ name: 'roadmapId' })
  roadmap: Roadmap;

  @Column({ nullable: true })
  roadmapId: string;
}
