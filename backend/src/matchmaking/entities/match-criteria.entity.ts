import { Entity, Column, OneToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';

@Entity('match_criteria')
export class MatchCriteria extends BaseEntity {
  @ApiProperty({ description: 'User ID' })
  @Column()
  userId: string;

  @ApiProperty({ description: 'Whether matchmaking is enabled for this user' })
  @Column({ default: true })
  enabled: boolean;

  @ApiProperty({ description: 'Minimum experience years for matches' })
  @Column({ nullable: true })
  minExperienceYears: number;

  @ApiProperty({ description: 'Maximum experience years for matches' })
  @Column({ nullable: true })
  maxExperienceYears: number;

  @ApiProperty({ description: 'Skills to match with' })
  @Column('simple-array', { nullable: true })
  desiredSkills: string[];

  @ApiProperty({ description: 'Skills to exclude from matching' })
  @Column('simple-array', { nullable: true })
  excludedSkills: string[];

  @ApiProperty({ description: 'Industries to match with' })
  @Column('simple-array', { nullable: true })
  industries: string[];

  @ApiProperty({ description: 'Locations to match with' })
  @Column('simple-array', { nullable: true })
  locations: string[];

  @ApiProperty({ description: 'Whether to match with remote users only' })
  @Column({ default: false })
  remoteOnly: boolean;

  @ApiProperty({ description: 'Maximum number of matches to receive per week' })
  @Column({ default: 5 })
  maxMatchesPerWeek: number;

  @ApiProperty({ description: 'Whether to receive match notifications' })
  @Column({ default: true })
  notificationsEnabled: boolean;

  // Relationships
  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
