import { Entity, Column, OneToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';

export enum CompanySize {
  MICRO = 'micro', // 1-10
  SMALL = 'small', // 11-50
  MEDIUM = 'medium', // 51-200
  LARGE = 'large', // 201-1000
  ENTERPRISE = 'enterprise', // 1000+
}

@Entity('companies')
export class Company extends BaseEntity {
  @ApiProperty({ description: 'Company name' })
  @Column()
  name: string;

  @ApiProperty({ description: 'Company description' })
  @Column({ type: 'text' })
  description: string;

  @ApiProperty({ description: 'Company logo URL' })
  @Column({ nullable: true })
  logo: string;

  @ApiProperty({ description: 'Company website URL' })
  @Column({ nullable: true })
  website: string;

  @ApiProperty({ description: 'Company industry' })
  @Column()
  industry: string;

  @ApiProperty({ description: 'Company size' })
  @Column({
    type: 'enum',
    enum: CompanySize,
    default: CompanySize.SMALL,
  })
  size: CompanySize;

  @ApiProperty({ description: 'Company location' })
  @Column()
  location: string;

  @ApiProperty({ description: 'Company founding year' })
  @Column({ nullable: true })
  foundingYear: number;

  @ApiProperty({ description: 'Company LinkedIn URL' })
  @Column({ nullable: true })
  linkedinUrl: string;

  @ApiProperty({ description: 'Company benefits offered' })
  @Column('simple-array', { nullable: true })
  benefits: string[];

  @ApiProperty({ description: 'Company culture keywords' })
  @Column('simple-array', { nullable: true })
  culture: string[];

  // Relationships
  @OneToOne(() => User, user => user.company)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;
}
