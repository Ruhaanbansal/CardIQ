import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';

import { MerchantsController } from './merchants.controller';
import { NormalizationService } from './services/normalization.service';
import { NarrationParserService } from './services/narration-parser.service';
import { FuzzyMatchingService } from './services/fuzzy-matching.service';
import { ResolutionEngineService } from './services/resolution-engine.service';

import { MerchantEntity } from '../../database/entities/merchant.entity';
import { UnknownMerchantEntity } from '../../database/entities/unknown-merchant.entity';
import { MerchantResolutionLogEntity } from '../../database/entities/merchant-resolution-log.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MerchantEntity,
      UnknownMerchantEntity,
      MerchantResolutionLogEntity
    ]),
    CacheModule.registerAsync({
      useFactory: async () => ({
        store: await redisStore({
          url: process.env.REDIS_URL || 'redis://localhost:6379',
        }),
      }),
    }),
  ],
  controllers: [MerchantsController],
  providers: [
    NormalizationService,
    NarrationParserService,
    FuzzyMatchingService,
    ResolutionEngineService
  ],
  exports: [ResolutionEngineService],
})
export class MerchantsModule {}
