import { Controller, Post, Body, Get, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ResolutionEngineService } from './services/resolution-engine.service';
import { NormalizationService } from './services/normalization.service';
import { NarrationParserService } from './services/narration-parser.service';
import { ResolveNarrationDto } from './dto/resolve-narration.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { MerchantEntity } from '../../database/entities/merchant.entity';
import { Repository } from 'typeorm';

@Controller('merchants')
export class MerchantsController {
  constructor(
    private readonly resolutionEngine: ResolutionEngineService,
    private readonly normalizer: NormalizationService,
    private readonly parser: NarrationParserService,
    @InjectRepository(MerchantEntity)
    private readonly merchantRepo: Repository<MerchantEntity>,
  ) {}

  @HttpCode(HttpStatus.OK)
  @Post('resolve')
  async resolveNarration(@Body() dto: ResolveNarrationDto) {
    return this.resolutionEngine.resolveNarration(dto.narration, dto.mccHint);
  }

  @HttpCode(HttpStatus.OK)
  @Post('normalize')
  async normalizeTest(@Body() dto: ResolveNarrationDto) {
    const parsed = this.parser.parse(dto.narration);
    const normalized = this.normalizer.normalize(parsed.merchantHint);
    
    return {
      raw: dto.narration,
      parsed,
      normalized,
    };
  }

  @Get('search')
  async searchMerchants(@Query('q') query: string) {
    if (!query || query.length < 2) return [];

    const normalizedQuery = this.normalizer.normalize(query);

    // Trigram based fuzzy search
    return this.merchantRepo
      .createQueryBuilder('merchant')
      .where('similarity(merchant.normalizedName, :search) > 0.3', { search: normalizedQuery })
      .orWhere('merchant.name ILIKE :likeSearch', { likeSearch: `%${query}%` })
      .orderBy(`similarity(merchant.normalizedName, '${normalizedQuery}')`, 'DESC')
      .addOrderBy('merchant.popularityScore', 'DESC')
      .take(10)
      .getMany();
  }
}
