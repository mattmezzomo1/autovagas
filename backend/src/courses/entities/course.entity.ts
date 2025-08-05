import { Entity, Column, ManyToMany, JoinTable } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';

export enum CourseLevel {
  BEGINNER = 'iniciante',
  INTERMEDIATE = 'intermediário',
  ADVANCED = 'avançado',
}

@Entity('courses')
export class Course extends BaseEntity {
  @ApiProperty({ description: 'Course title' })
  @Column()
  title: string;

  @ApiProperty({ description: 'Course description' })
  @Column({ type: 'text' })
  description: string;

  @ApiProperty({ description: 'Course provider' })
  @Column()
  provider: string;

  @ApiProperty({ description: 'Course URL' })
  @Column()
  url: string;

  @ApiProperty({ description: 'Course image URL' })
  @Column({ nullable: true })
  imageUrl: string;

  @ApiProperty({ description: 'Course price' })
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  price: number;

  @ApiProperty({ description: 'Course discount price' })
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  discountPrice: number;

  @ApiProperty({ description: 'Course duration' })
  @Column({ nullable: true })
  duration: string;

  @ApiProperty({ description: 'Course level' })
  @Column({
    type: 'enum',
    enum: CourseLevel,
    default: CourseLevel.BEGINNER,
  })
  level: CourseLevel;

  @ApiProperty({ description: 'Course tags/skills' })
  @Column('simple-array')
  tags: string[];

  @ApiProperty({ description: 'Course category' })
  @Column()
  category: string;

  @ApiProperty({ description: 'Course rating' })
  @Column({ type: 'decimal', precision: 3, scale: 1, nullable: true })
  rating: number;

  @ApiProperty({ description: 'Whether the course is featured' })
  @Column({ default: false })
  featured: boolean;

  // Relationships
  @ManyToMany(() => User)
  @JoinTable({
    name: 'user_courses',
    joinColumn: { name: 'course_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'user_id', referencedColumnName: 'id' },
  })
  users: User[];
}
