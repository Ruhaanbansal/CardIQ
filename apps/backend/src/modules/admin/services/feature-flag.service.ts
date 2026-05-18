import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FeatureFlagEntity } from '../../../database/entities/admin.entities';
import { FeatureFlag, FlagEnvironment } from '../interfaces/admin.interface';

@Injectable()
export class FeatureFlagService {
  private readonly logger = new Logger(FeatureFlagService.name);
  // In-memory cache to avoid DB round-trips on every request
  private readonly cache = new Map<string, FeatureFlag>();

  constructor(
    @InjectRepository(FeatureFlagEntity)
    private readonly flagRepo: Repository<FeatureFlagEntity>,
  ) {
    this.loadAll();
  }

  private async loadAll() {
    const flags = await this.flagRepo.find();
    for (const f of flags) this.cache.set(f.key, f as any);
    this.logger.log(`Loaded ${flags.length} feature flags into cache.`);
  }

  /**
   * Check if a feature flag is enabled for a given user/session.
   * Respects rollout percentage via deterministic hash.
   */
  isEnabled(key: string, userId?: string): boolean {
    const flag = this.cache.get(key);
    if (!flag || !flag.isEnabled) return false;
    if (flag.isKillSwitch) return false;
    if (flag.rolloutPercentage >= 100) return true;
    if (!userId) return flag.rolloutPercentage > 0;

    // Deterministic rollout: hash(key + userId) mod 100
    let hash = 0;
    const str = key + userId;
    for (let i = 0; i < str.length; i++) {
      hash = (hash * 31 + str.charCodeAt(i)) & 0xffffffff;
    }
    return Math.abs(hash) % 100 < flag.rolloutPercentage;
  }

  async getAll(env?: FlagEnvironment): Promise<FeatureFlagEntity[]> {
    const where = env ? { environment: env } : {};
    return this.flagRepo.find({ where, order: { key: 'ASC' } });
  }

  async upsert(data: Partial<FeatureFlagEntity>, createdBy: string): Promise<FeatureFlagEntity> {
    let flag = data.key ? await this.flagRepo.findOne({ where: { key: data.key } }) : null;

    if (flag) {
      Object.assign(flag, data, { updatedAt: new Date() });
    } else {
      flag = this.flagRepo.create({ ...data, createdBy, updatedAt: new Date() });
    }

    await this.flagRepo.save(flag);
    this.cache.set(flag.key, flag as any);
    this.logger.log(`Feature flag "${flag.key}" updated → enabled=${flag.isEnabled}`);
    return flag;
  }

  async toggleKillSwitch(key: string, kill: boolean): Promise<FeatureFlagEntity> {
    const flag = await this.flagRepo.findOne({ where: { key } });
    if (!flag) throw new NotFoundException(`Flag "${key}" not found.`);
    flag.isKillSwitch = kill;
    flag.isEnabled = !kill; // Kill switch disables the flag
    flag.updatedAt = new Date();
    await this.flagRepo.save(flag);
    this.cache.set(key, flag as any);
    this.logger.warn(`Kill switch "${key}" → ${kill ? 'ACTIVATED' : 'deactivated'}`);
    return flag;
  }
}
