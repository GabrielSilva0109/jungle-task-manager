import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { TaskStatus, TaskPriority } from '@jungle/types';
import { Comment } from './comment.entity';
import { TaskAssignment } from './task-assignment.entity';
import { AuditLog } from './audit-log.entity';

@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column({
    type: 'enum',
    enum: TaskStatus,
    default: TaskStatus.TODO,
  })
  status: TaskStatus;

  @Column({
    type: 'enum',
    enum: TaskPriority,
    default: TaskPriority.MEDIUM,
  })
  priority: TaskPriority;

  @Column('timestamp')
  deadline: Date;

  @Column('uuid')
  createdBy: string;

  @OneToMany(() => Comment, (comment) => comment.task, {
    cascade: true,
  })
  comments: Comment[];

  @OneToMany(() => TaskAssignment, (assignment) => assignment.task, {
    cascade: true,
  })
  assignments: TaskAssignment[];

  @OneToMany(() => AuditLog, (audit) => audit.task, {
    cascade: true,
  })
  auditLogs: AuditLog[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}