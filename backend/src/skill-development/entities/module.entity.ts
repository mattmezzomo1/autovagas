import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../common/entities/base.entity';
import { Course } from '../../courses/entities/course.entity';
import { Lesson } from './lesson.entity';

export enum ModuleStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

@Entity('modules')
export class Module extends BaseEntity {
  @ApiProperty({ description: 'Module title' })
  @Column()
  title: string;

  @ApiProperty({ description: 'Module description' })
  @Column({ type: 'text' })
  description: string;

  @ApiProperty({ description: 'Order of this module in the course' })
  @Column()
  order: number;

  @ApiProperty({ description: 'Estimated duration in minutes' })
  @Column()
  estimatedDurationMinutes: number;

  @ApiProperty({ description: 'Module status' })
  @Column({
    type: 'enum',
    enum: ModuleStatus,
    default: ModuleStatus.DRAFT,
  })
  status: ModuleStatus;

  @ApiProperty({ description: 'Learning objectives for this module' })
  @Column('simple-array', { nullable: true })
  learningObjectives: string[];

  @ApiProperty({ description: 'Prerequisites for this module' })
  @Column('simple-array', { nullable: true })
  prerequisites: string[];

  @ApiProperty({ description: 'Skills covered in this module' })
  @Column('simple-array', { nullable: true })
  skillsCovered: string[];

  @ApiProperty({ description: 'Module thumbnail image URL' })
  @Column({ nullable: true })
  thumbnailUrl: string;

  @ApiProperty({ description: 'Whether this module is free or premium' })
  @Column({ default: false })
  isPremium: boolean;

  @ApiProperty({ description: 'Additional resources or materials' })
  @Column({ type: 'text', nullable: true })
  resources: string;

  @ApiProperty({ description: 'Module summary or overview' })
  @Column({ type: 'text', nullable: true })
  summary: string;

  // Relationships
  @ManyToOne(() => Course, course => course.modules)
  @JoinColumn({ name: 'courseId' })
  course: Course;

  @Column()
  courseId: string;

  @OneToMany(() => Lesson, lesson => lesson.module, { cascade: true })
  lessons: Lesson[];
}
