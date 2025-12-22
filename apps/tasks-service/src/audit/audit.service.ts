import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AuditLog } from '../entities/audit-log.entity';

interface AuditLogData {
  taskId: string;
  action: string;
  oldValue?: any;
  newValue?: any;
  userId: string;
}

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private auditRepository: Repository<AuditLog>,
  ) {}

  async log(data: AuditLogData): Promise<AuditLog> {
    const audit = this.auditRepository.create(data);
    return this.auditRepository.save(audit);
  }

  async findByTask(taskId: string): Promise<AuditLog[]> {
    return this.auditRepository.find({
      where: { taskId },
      order: { createdAt: 'DESC' },
    });
  }
}