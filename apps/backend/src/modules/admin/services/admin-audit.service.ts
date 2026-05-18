import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdminAuditLogEntity } from '../../../database/entities/admin.entities';
import { AdminAuditEvent } from '../interfaces/admin.interface';

@Injectable()
export class AdminAuditService {
  private readonly logger = new Logger(AdminAuditService.name);

  constructor(
    @InjectRepository(AdminAuditLogEntity)
    private readonly auditRepo: Repository<AdminAuditLogEntity>,
  ) {}

  async log(event: AdminAuditEvent): Promise<void> {
    const record = this.auditRepo.create({
      adminId: event.adminId,
      adminEmail: event.adminEmail,
      adminRole: event.adminRole,
      action: event.action,
      entityType: event.entityType,
      entityId: event.entityId,
      previousValue: event.previousValue,
      newValue: event.newValue,
      ipAddress: event.ipAddress,
      sessionId: event.sessionId,
      timestamp: event.timestamp ?? new Date(),
    });

    await this.auditRepo.save(record);

    this.logger.log(
      `[AUDIT] ${event.adminEmail} (${event.adminRole}) → ${event.action} ` +
      `on ${event.entityType}${event.entityId ? ':' + event.entityId : ''}`,
    );
  }

  async getRecentLogs(limit = 100, action?: string): Promise<AdminAuditLogEntity[]> {
    const query = this.auditRepo.createQueryBuilder('log')
      .orderBy('log.timestamp', 'DESC')
      .take(limit);

    if (action) query.where('log.action = :action', { action });

    return query.getMany();
  }

  async getLogsByAdmin(adminId: string, limit = 50): Promise<AdminAuditLogEntity[]> {
    return this.auditRepo.find({
      where: { adminId },
      order: { timestamp: 'DESC' },
      take: limit,
    });
  }
}
