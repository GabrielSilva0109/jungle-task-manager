import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('task_audit_log')
export class TaskAuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  taskId: string;

  @Column('uuid')
  userId: string;

  @Column()
  action: string; // e.g. created, updated, status_changed, assigned, etc

  @Column({ type: 'jsonb', nullable: true })
  before: any;

  @Column({ type: 'jsonb', nullable: true })
  after: any;

  @CreateDateColumn()
  createdAt: Date;
}
