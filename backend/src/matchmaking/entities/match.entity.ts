import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';

export enum MatchStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
}

@Entity('matches')
export class Match extends BaseEntity {
  @ApiProperty({ description: 'ID of the user who initiated the match' })
  @Column()
  initiatorId: string;

  @ApiProperty({ description: 'ID of the user who received the match request' })
  @Column()
  receiverId: string;

  @ApiProperty({ description: 'Match score (0-100)' })
  @Column({ type: 'int' })
  score: number;

  @ApiProperty({ description: 'Match status' })
  @Column({
    type: 'enum',
    enum: MatchStatus,
    default: MatchStatus.PENDING,
  })
  status: MatchStatus;

  @ApiProperty({ description: 'Reasons for the match' })
  @Column('simple-array', { nullable: true })
  matchReasons: string[];

  @ApiProperty({ description: 'Notes about the match' })
  @Column({ type: 'text', nullable: true })
  notes: string;

  @ApiProperty({ description: 'Date when the match was accepted or rejected' })
  @Column({ nullable: true })
  respondedAt: Date;

  // Relationships
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'initiator_id' })
  initiator: User;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'receiver_id' })
  receiver: User;
}
