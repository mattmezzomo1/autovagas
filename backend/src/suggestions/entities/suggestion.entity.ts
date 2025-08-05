import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';

export enum SuggestionType {
  COURSE = 'course',
  BOOK = 'book',
  TRAINING = 'training',
  CERTIFICATION = 'certification',
  SKILL = 'skill',
}

@Entity('suggestions')
export class Suggestion extends BaseEntity {
  @ApiProperty({ description: 'Suggestion title' })
  @Column()
  title: string;

  @ApiProperty({ description: 'Suggestion description' })
  @Column({ type: 'text' })
  description: string;

  @ApiProperty({ description: 'Suggestion type' })
  @Column({
    type: 'enum',
    enum: SuggestionType,
  })
  type: SuggestionType;

  @ApiProperty({ description: 'Provider name' })
  @Column({ nullable: true })
  provider: string;

  @ApiProperty({ description: 'Original price' })
  @Column({ nullable: true })
  originalPrice: number;

  @ApiProperty({ description: 'Discounted price' })
  @Column({ nullable: true })
  discountPrice: number;

  @ApiProperty({ description: 'Discount percentage' })
  @Column({ nullable: true })
  discountPercentage: number;

  @ApiProperty({ description: 'Relevance score (1-5)' })
  @Column()
  relevance: number;

  @ApiProperty({ description: 'Duration of the course/training' })
  @Column({ nullable: true })
  duration: string;

  @ApiProperty({ description: 'Link to the suggestion' })
  @Column({ nullable: true })
  link: string;

  @ApiProperty({ description: 'Image URL' })
  @Column({ nullable: true })
  image: string;

  @ApiProperty({ description: 'Tags related to the suggestion' })
  @Column('simple-array', { nullable: true })
  tags: string[];

  @ApiProperty({ description: 'Whether this is a featured suggestion' })
  @Column({ default: false })
  isFeatured: boolean;

  @ApiProperty({ description: 'Whether this is a personalized suggestion' })
  @Column({ default: false })
  isPersonalized: boolean;

  // Relationships
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ nullable: true })
  userId: string;
}
