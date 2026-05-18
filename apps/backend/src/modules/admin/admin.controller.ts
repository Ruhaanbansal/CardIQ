import {
  Controller, Get, Post, Put, Delete, Body, Param, Query,
  HttpCode, HttpStatus, Req, UseGuards,
} from '@nestjs/common';
import { Request } from 'express';

import { AdminService } from './services/admin.service';
import { AdminAuditService } from './services/admin-audit.service';
import { FeatureFlagService } from './services/feature-flag.service';
import { ApprovalWorkflowService } from './services/approval-workflow.service';
import { ModerationService } from './services/moderation.service';
import { AdminRolesGuard, Permissions, AdminJwtPayload } from './guards/admin-roles.guard';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreditCardEntity } from '../../database/entities/credit-card.entity';
import { RewardRuleEntity } from '../../database/entities/reward-rule.entity';
import { FeatureFlagEntity } from '../../database/entities/admin.entities';
import { ScrapeSchedulerService } from '../scraper/services/scrape-scheduler.service';

const adminOf = (req: Request): AdminJwtPayload => (req as any).admin;
const ip = (req: Request): string => req.ip ?? 'unknown';

@Controller('admin')
@UseGuards(AdminRolesGuard)
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly auditService: AdminAuditService,
    private readonly flagService: FeatureFlagService,
    private readonly approvalService: ApprovalWorkflowService,
    private readonly moderationService: ModerationService,
    private readonly scraperScheduler: ScrapeSchedulerService,
    @InjectRepository(CreditCardEntity) private readonly cardRepo: Repository<CreditCardEntity>,
    @InjectRepository(RewardRuleEntity) private readonly ruleRepo: Repository<RewardRuleEntity>,
  ) {}

  // ── System Health ──────────────────────────────────────────
  @Get('system-health')
  @Permissions('card:read')
  getSystemHealth() { return this.adminService.getSystemHealth(); }

  @Get('queue-stats')
  @Permissions('queue:read')
  getQueueStats() { return this.adminService.getQueueStats(); }

  // ── Card Management ───────────────────────────────────────
  @Get('cards')
  @Permissions('card:read')
  getCards(@Query('limit') limit = 50, @Query('search') search?: string) {
    const query = this.cardRepo.createQueryBuilder('c').take(+limit).orderBy('c.cardName', 'ASC');
    if (search) query.where('c.cardName ILIKE :s OR c.issuerName ILIKE :s', { s: `%${search}%` });
    return query.getMany();
  }

  @Post('cards')
  @Permissions('card:write')
  async createCard(@Body() body: Partial<CreditCardEntity>, @Req() req: Request) {
    const card = await this.cardRepo.save(this.cardRepo.create(body));
    await this.auditService.log({ adminId: adminOf(req).sub, adminEmail: adminOf(req).email, adminRole: adminOf(req).role, action: 'CARD_CREATED', entityType: 'CreditCard', entityId: card.id, newValue: body, ipAddress: ip(req), sessionId: adminOf(req).sessionId, timestamp: new Date() });
    return card;
  }

  @Put('cards/:id')
  @Permissions('card:write')
  async updateCard(@Param('id') id: string, @Body() body: Partial<CreditCardEntity>, @Req() req: Request) {
    const prev = await this.cardRepo.findOneOrFail({ where: { id } });
    await this.cardRepo.update(id, body);
    await this.auditService.log({ adminId: adminOf(req).sub, adminEmail: adminOf(req).email, adminRole: adminOf(req).role, action: 'CARD_UPDATED', entityType: 'CreditCard', entityId: id, previousValue: prev, newValue: body, ipAddress: ip(req), sessionId: adminOf(req).sessionId, timestamp: new Date() });
    return { id, updated: true };
  }

  @Delete('cards/:id')
  @Permissions('card:delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteCard(@Param('id') id: string, @Req() req: Request) {
    await this.cardRepo.softDelete(id);
    await this.auditService.log({ adminId: adminOf(req).sub, adminEmail: adminOf(req).email, adminRole: adminOf(req).role, action: 'CARD_DELETED', entityType: 'CreditCard', entityId: id, ipAddress: ip(req), sessionId: adminOf(req).sessionId, timestamp: new Date() });
  }

  // ── Reward Rules ──────────────────────────────────────────
  @Get('rules')
  @Permissions('rule:read')
  getRules(@Query('cardId') cardId?: string) {
    const where = cardId ? { cardId } : {};
    return this.ruleRepo.find({ where, order: { priority: 'ASC' } });
  }

  @Post('rules')
  @Permissions('rule:write')
  async createRule(@Body() body: Partial<RewardRuleEntity>, @Req() req: Request) {
    const rule = await this.ruleRepo.save(this.ruleRepo.create(body));
    await this.auditService.log({ adminId: adminOf(req).sub, adminEmail: adminOf(req).email, adminRole: adminOf(req).role, action: 'RULE_CREATED', entityType: 'RewardRule', entityId: rule.id, newValue: body, ipAddress: ip(req), sessionId: adminOf(req).sessionId, timestamp: new Date() });
    return rule;
  }

  @Put('rules/:id')
  @Permissions('rule:write')
  async updateRule(@Param('id') id: string, @Body() body: Partial<RewardRuleEntity>, @Req() req: Request) {
    const prev = await this.ruleRepo.findOneOrFail({ where: { id } });
    await this.ruleRepo.update(id, body);
    await this.auditService.log({ adminId: adminOf(req).sub, adminEmail: adminOf(req).email, adminRole: adminOf(req).role, action: 'RULE_UPDATED', entityType: 'RewardRule', entityId: id, previousValue: prev, newValue: body, ipAddress: ip(req), sessionId: adminOf(req).sessionId, timestamp: new Date() });
    return { id, updated: true };
  }

  // ── Merchant Review ───────────────────────────────────────
  @Get('merchants/review')
  @Permissions('merchant:read')
  getMerchantReviewQueue(@Query('limit') limit = 50) {
    return this.approvalService.getPendingMerchantReviews(+limit);
  }

  @Post('merchants/approve')
  @Permissions('merchant:approve')
  approveMerchant(@Body() body: { merchantId: string }, @Req() req: Request) {
    return this.approvalService.approveMerchant(body.merchantId, adminOf(req), ip(req));
  }

  @Post('merchants/merge')
  @Permissions('merchant:merge')
  mergeMerchants(@Body() body: { sourceId: string; targetId: string }, @Req() req: Request) {
    return this.approvalService.mergeMerchants(body.sourceId, body.targetId, adminOf(req), ip(req));
  }

  // ── Scraper Monitoring ────────────────────────────────────
  @Get('scrapers')
  @Permissions('scraper:read')
  getScraperJobs(@Query('limit') limit = 30) {
    return this.scraperScheduler.getJobs(+limit);
  }

  @Post('scrapers/retry-all')
  @Permissions('scraper:retry')
  async retryAllFailed(@Req() req: Request) {
    await this.scraperScheduler.enqueueAllBanks();
    await this.auditService.log({ adminId: adminOf(req).sub, adminEmail: adminOf(req).email, adminRole: adminOf(req).role, action: 'SCRAPER_RETRY', entityType: 'ScrapeJob', ipAddress: ip(req), sessionId: adminOf(req).sessionId, timestamp: new Date() });
    return { message: 'All bank scrapers re-queued.' };
  }

  // ── Feature Flags ─────────────────────────────────────────
  @Get('feature-flags')
  @Permissions('flag:read')
  getFlags(@Query('env') env?: any) { return this.flagService.getAll(env); }

  @Put('feature-flags/:key')
  @Permissions('flag:write')
  async updateFlag(@Param('key') key: string, @Body() body: Partial<FeatureFlagEntity>, @Req() req: Request) {
    const flag = await this.flagService.upsert({ ...body, key }, adminOf(req).email);
    await this.auditService.log({ adminId: adminOf(req).sub, adminEmail: adminOf(req).email, adminRole: adminOf(req).role, action: 'FLAG_UPDATED', entityType: 'FeatureFlag', entityId: key, newValue: body, ipAddress: ip(req), sessionId: adminOf(req).sessionId, timestamp: new Date() });
    return flag;
  }

  @Post('feature-flags/:key/kill')
  @Permissions('flag:write')
  async killSwitch(@Param('key') key: string, @Body() body: { kill: boolean }, @Req() req: Request) {
    const flag = await this.flagService.toggleKillSwitch(key, body.kill);
    await this.auditService.log({ adminId: adminOf(req).sub, adminEmail: adminOf(req).email, adminRole: adminOf(req).role, action: 'FLAG_UPDATED', entityType: 'FeatureFlag', entityId: key, newValue: { isKillSwitch: body.kill }, ipAddress: ip(req), sessionId: adminOf(req).sessionId, timestamp: new Date() });
    return flag;
  }

  // ── Audit Logs ────────────────────────────────────────────
  @Get('audit-logs')
  @Permissions('audit:read')
  getAuditLogs(@Query('limit') limit = 100, @Query('action') action?: string) {
    return this.auditService.getRecentLogs(+limit, action);
  }

  // ── Moderation ────────────────────────────────────────────
  @Post('users/:id/suspend')
  @Permissions('user:moderate')
  suspendUser(@Param('id') id: string, @Body() body: { reason: string }, @Req() req: Request) {
    return this.moderationService.suspendUser(id, body.reason, adminOf(req), ip(req));
  }

  @Post('users/:id/reinstate')
  @Permissions('user:moderate')
  reinstateUser(@Param('id') id: string, @Req() req: Request) {
    return this.moderationService.reinstateUser(id, adminOf(req), ip(req));
  }

  // ── Benefit Changes Review ────────────────────────────────
  @Get('benefit-changes')
  @Permissions('card:read')
  getChanges(@Query('limit') limit = 20) {
    return this.adminService.getRecentChanges(+limit);
  }

  @Post('benefit-changes/:id/reviewed')
  @Permissions('card:write')
  markReviewed(@Param('id') id: string) {
    return this.adminService.markChangeReviewed(id);
  }
}
