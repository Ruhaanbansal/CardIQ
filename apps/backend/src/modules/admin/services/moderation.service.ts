import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../../../database/entities/user.entity';
import { AdminAuditService } from './admin-audit.service';
import { AdminJwtPayload } from '../guards/admin-roles.guard';

@Injectable()
export class ModerationService {
  private readonly logger = new Logger(ModerationService.name);

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    private readonly audit: AdminAuditService,
  ) {}

  async suspendUser(userId: string, reason: string, admin: AdminJwtPayload, ip?: string) {
    const user = await this.userRepo.findOneOrFail({ where: { id: userId } });
    const prev = { isActive: (user as any).isActive };

    (user as any).isActive = false;
    (user as any).suspendedReason = reason;
    await this.userRepo.save(user);

    await this.audit.log({
      adminId: admin.sub,
      adminEmail: admin.email,
      adminRole: admin.role,
      action: 'USER_SUSPENDED',
      entityType: 'User',
      entityId: userId,
      previousValue: prev,
      newValue: { isActive: false, reason },
      ipAddress: ip,
      sessionId: admin.sessionId,
      timestamp: new Date(),
    });

    this.logger.warn(`User ${userId} suspended by ${admin.email}: ${reason}`);
    return { userId, status: 'suspended', reason };
  }

  async reinstateUser(userId: string, admin: AdminJwtPayload, ip?: string) {
    const user = await this.userRepo.findOneOrFail({ where: { id: userId } });
    (user as any).isActive = true;
    (user as any).suspendedReason = null;
    await this.userRepo.save(user);

    await this.audit.log({
      adminId: admin.sub,
      adminEmail: admin.email,
      adminRole: admin.role,
      action: 'USER_REINSTATED',
      entityType: 'User',
      entityId: userId,
      timestamp: new Date(),
    });
    return { userId, status: 'active' };
  }

  async searchUsers(query: string, limit = 20) {
    return this.userRepo
      .createQueryBuilder('u')
      .where('u.email ILIKE :q OR u.id::text = :exact', { q: `%${query}%`, exact: query })
      .take(limit)
      .getMany();
  }
}
