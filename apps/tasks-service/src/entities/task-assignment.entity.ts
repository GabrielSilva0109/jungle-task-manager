import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Task } from './task.entity';

@Entity('task_assignments')
@Index(['taskId', 'userId'], { unique: true })
export class TaskAssignment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  taskId: string;

  @Column('uuid')
  userId: string;

  @ManyToOne(() => Task, (task) => task.assignments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'taskId' })
  task: Task;

  @CreateDateColumn()
  assignedAt: Date;
}