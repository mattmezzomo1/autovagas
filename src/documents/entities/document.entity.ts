import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum DocumentType {
  RESUME = 'RESUME',
  COVER_LETTER = 'COVER_LETTER',
  PORTFOLIO = 'PORTFOLIO',
  CERTIFICATE = 'CERTIFICATE',
  OTHER = 'OTHER',
}

export enum DocumentFormat {
  PDF = 'PDF',
  DOCX = 'DOCX',
  TXT = 'TXT',
  HTML = 'HTML',
  MARKDOWN = 'MARKDOWN',
}

export enum DocumentSource {
  UPLOAD = 'UPLOAD',
  AI_GENERATED = 'AI_GENERATED',
  TEMPLATE = 'TEMPLATE',
}

@Entity('documents')
export class Document {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column()
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: DocumentType,
    default: DocumentType.RESUME,
  })
  type: DocumentType;

  @Column({
    type: 'enum',
    enum: DocumentFormat,
    default: DocumentFormat.PDF,
  })
  format: DocumentFormat;

  @Column({
    type: 'enum',
    enum: DocumentSource,
    default: DocumentSource.UPLOAD,
  })
  source: DocumentSource;

  @Column()
  url: string;

  @Column({ nullable: true })
  fileSize: number;

  @Column({ nullable: true })
  contentType: string;

  @Column({ default: false })
  isDefault: boolean;

  @Column({ nullable: true, type: 'text' })
  content: string;

  @Column({ nullable: true, type: 'jsonb' })
  metadata: any;

  @Column({ default: 0 })
  usageCount: number;

  @Column({ default: true })
  isActive: boolean;
}
