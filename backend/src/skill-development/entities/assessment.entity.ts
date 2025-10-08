import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../common/entities/base.entity';
import { Lesson } from './lesson.entity';
import { UserProgress } from './user-progress.entity';

export enum AssessmentType {
  MULTIPLE_CHOICE = 'multiple_choice',
  TRUE_FALSE = 'true_false',
  SHORT_ANSWER = 'short_answer',
  ESSAY = 'essay',
  PRACTICAL = 'practical',
  CODE_CHALLENGE = 'code_challenge',
}

export enum AssessmentStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

interface QuestionOption {
  id: string;
  text: string;
  isCorrect: boolean;
  explanation?: string;
}

interface Question {
  id: string;
  question: string;
  type: AssessmentType;
  options?: QuestionOption[];
  correctAnswer?: string;
  explanation?: string;
  points: number;
}

@Entity('assessments')
export class Assessment extends BaseEntity {
  @ApiProperty({ description: 'Assessment title' })
  @Column()
  title: string;

  @ApiProperty({ description: 'Assessment description' })
  @Column({ type: 'text' })
  description: string;

  @ApiProperty({ description: 'Type of assessment' })
  @Column({
    type: 'enum',
    enum: AssessmentType,
  })
  type: AssessmentType;

  @ApiProperty({ description: 'Assessment status' })
  @Column({
    type: 'enum',
    enum: AssessmentStatus,
    default: AssessmentStatus.DRAFT,
  })
  status: AssessmentStatus;

  @ApiProperty({ description: 'Questions in JSON format' })
  @Column({ type: 'text' })
  questions: string; // JSON string of Question[]

  @ApiProperty({ description: 'Total points possible' })
  @Column()
  totalPoints: number;

  @ApiProperty({ description: 'Minimum score to pass (percentage)' })
  @Column({ default: 70 })
  passingScore: number;

  @ApiProperty({ description: 'Time limit in minutes' })
  @Column({ nullable: true })
  timeLimitMinutes: number;

  @ApiProperty({ description: 'Number of attempts allowed' })
  @Column({ default: 3 })
  maxAttempts: number;

  @ApiProperty({ description: 'Whether questions are randomized' })
  @Column({ default: false })
  randomizeQuestions: boolean;

  @ApiProperty({ description: 'Whether to show correct answers after completion' })
  @Column({ default: true })
  showCorrectAnswers: boolean;

  @ApiProperty({ description: 'Whether to show explanations after completion' })
  @Column({ default: true })
  showExplanations: boolean;

  @ApiProperty({ description: 'Instructions for the assessment' })
  @Column({ type: 'text', nullable: true })
  instructions: string;

  @ApiProperty({ description: 'Skills being assessed' })
  @Column('simple-array', { nullable: true })
  skillsAssessed: string[];

  @ApiProperty({ description: 'Order within the lesson' })
  @Column({ default: 0 })
  order: number;

  // Relationships
  @ManyToOne(() => Lesson, lesson => lesson.assessments, { nullable: true })
  @JoinColumn({ name: 'lessonId' })
  lesson: Lesson;

  @Column({ nullable: true })
  lessonId: string;

  @OneToMany(() => UserProgress, progress => progress.assessment)
  userProgress: UserProgress[];
}
