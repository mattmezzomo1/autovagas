import { Entity, Column, ManyToMany, JoinTable } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';

export enum SkillCategory {
  TECHNICAL = 'technical',
  SOFT_SKILL = 'soft_skill',
  LANGUAGE = 'language',
  CERTIFICATION = 'certification',
  TOOL = 'tool',
  FRAMEWORK = 'framework',
  METHODOLOGY = 'methodology',
}

export enum SkillLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  EXPERT = 'expert',
}

@Entity('skills')
export class Skill extends BaseEntity {
  @ApiProperty({ description: 'Skill name' })
  @Column({ unique: true })
  name: string;

  @ApiProperty({ description: 'Skill description' })
  @Column({ type: 'text', nullable: true })
  description: string;

  @ApiProperty({ description: 'Skill category' })
  @Column({
    type: 'enum',
    enum: SkillCategory,
  })
  category: SkillCategory;

  @ApiProperty({ description: 'Parent skill (for hierarchical skills)' })
  @Column({ nullable: true })
  parentSkillId: string;

  @ApiProperty({ description: 'Related skills' })
  @Column('simple-array', { nullable: true })
  relatedSkills: string[];

  @ApiProperty({ description: 'Industry relevance' })
  @Column('simple-array', { nullable: true })
  industries: string[];

  @ApiProperty({ description: 'Job roles that commonly use this skill' })
  @Column('simple-array', { nullable: true })
  commonJobRoles: string[];

  @ApiProperty({ description: 'Skill icon or image URL' })
  @Column({ nullable: true })
  iconUrl: string;

  @ApiProperty({ description: 'Skill color for UI representation' })
  @Column({ nullable: true })
  color: string;

  @ApiProperty({ description: 'Whether this skill is trending' })
  @Column({ default: false })
  isTrending: boolean;

  @ApiProperty({ description: 'Whether this skill is in high demand' })
  @Column({ default: false })
  isHighDemand: boolean;

  @ApiProperty({ description: 'Average salary impact (percentage)' })
  @Column({ nullable: true })
  salaryImpact: number;

  @ApiProperty({ description: 'Learning difficulty (1-5)' })
  @Column({ default: 3 })
  difficultyLevel: number;

  @ApiProperty({ description: 'Estimated time to learn (in hours)' })
  @Column({ nullable: true })
  estimatedLearningHours: number;

  @ApiProperty({ description: 'Tags for better searchability' })
  @Column('simple-array', { nullable: true })
  tags: string[];

  @ApiProperty({ description: 'External resources for learning this skill' })
  @Column({ type: 'text', nullable: true })
  learningResources: string; // JSON string

  // Relationships
  @ManyToMany(() => User, user => user.skillsEntity)
  @JoinTable({
    name: 'user_skills',
    joinColumn: { name: 'skill_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'user_id', referencedColumnName: 'id' },
  })
  users: User[];
}
