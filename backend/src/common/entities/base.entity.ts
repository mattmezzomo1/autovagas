import { 
  PrimaryGeneratedColumn, 
  CreateDateColumn, 
  UpdateDateColumn,
  DeleteDateColumn
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export abstract class BaseEntity {
  @ApiProperty({ description: 'Unique identifier' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Creation timestamp' })
  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @ApiProperty({ description: 'Deletion timestamp (for soft delete)' })
  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deletedAt?: Date;
}
