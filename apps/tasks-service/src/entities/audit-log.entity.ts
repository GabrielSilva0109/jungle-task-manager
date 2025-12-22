import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Task } from './task.entity';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  taskId: string;

  @Column()
  action: string;

  @Column('jsonb', { nullable: true })
  oldValue: any;

  @Column('jsonb', { nullable: true })
  newValue: any;

  @Column('uuid')
  userId: string;

  @ManyToOne(() => Task, (task) => task.auditLogs, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'taskId' })
  task: Task;

  @CreateDateColumn()
  createdAt: Date;
}