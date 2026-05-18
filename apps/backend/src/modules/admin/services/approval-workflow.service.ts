import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MerchantEntity } from '../../../database/entities/merchant.entity';
import { AdminAuditService } from './admin-audit.service';
import { AdminJwtPayload } from '../guards/admin-roles.guard';

@Injectable()
export class ApprovalWorkflowService {
  private readonly logger = new Logger(ApprovalWorkflowService.name);

  constructor(
    @InjectRepository(MerchantEntity)
    private readonly merchantRepo: Repository<MerchantEntity>,
    private readonly audit: AdminAuditService,
  ) {}

  async getPendingMerchantReviews(limit = 50) {
    return this.merchantRepo.find({
      where: { verificationStatus: 'unverified' as any },
      order: { createdAt: 'DESC' } as any,
      take: limit,
    });
  }

  async approveMerchant(
    merchantId: string,
    admin: AdminJwtPayload,
    ip?: string,
  ): Promise<MerchantEntity> {
    const merchant = await this.merchantRepo.findOneOrFail({ where: { id: merchantId } });
    const prev = { verificationStatus: (merchant as any).verificationStatus };

    (merchant as any).verificationStatus = 'verified';
    await this.merchantRepo.save(merchant);

    await this.audit.log({
      adminId: admin.sub,
      adminEmail: admin.email,
      adminRole: admin.role,
      action: 'MERCHANT_APPROVED',
      entityType: 'Merchant',
      entityId: merchantId,
      previousValue: prev,
      newValue: { verificationStatus: 'verified' },
      ipAddress: ip,
      sessionId: admin.sessionId,
      timestamp: new Date(),
    });

    this.logger.log(`Merchant ${merchantId} approved by ${admin.email}`);
    return merchant;
  }

  async rejectMerchant(merchantId: string, admin: AdminJwtPayload, ip?: string) {
    const merchant = await this.merchantRepo.findOneOrFail({ where: { id: merchantId } });
    (merchant as any).verificationStatus = 'rejected';
    await this.merchantRepo.save(merchant);

    await this.audit.log({
      adminId: admin.sub,
      adminEmail: admin.email,
      adminRole: admin.role,
      action: 'MERCHANT_REJECTED',
      entityType: 'Merchant',
      entityId: merchantId,
      ipAddress: ip,
      sessionId: admin.sessionId,
      timestamp: new Date(),
    });
    return merchant;
  }

  async mergeMerchants(
    sourceId: string,
    targetId: string,
    admin: AdminJwtPayload,
    ip?: string,
  ) {
    // Mark source as merged/alias of target
    const source = await this.merchantRepo.findOneOrFail({ where: { id: sourceId } });
    (source as any).verificationStatus = 'merged';
    (source as any).mergedIntoId = targetId;
    await this.merchantRepo.save(source);

    await this.audit.log({
      adminId: admin.sub,
      adminEmail: admin.email,
      adminRole: admin.role,
      action: 'MERCHANT_MERGED',
      entityType: 'Merchant',
      entityId: sourceId,
      newValue: { mergedInto: targetId },
      ipAddress: ip,
      sessionId: admin.sessionId,
      timestamp: new Date(),
    });
    return { sourceId, targetId, status: 'merged' };
  }
}
