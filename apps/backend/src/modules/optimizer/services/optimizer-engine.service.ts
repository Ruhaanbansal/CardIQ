import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import { CreditCardEntity } from '../../../database/entities/credit-card.entity';
import {
  OptimizationRequest,
  OptimizationResult,
  RankedCard,
} from '../interfaces/optimizer.interface';
import { MerchantRoutingService } from './merchant-routing.service';
import { TransactionSimulationService } from './transaction-simulation.service';
import { TransactionRankingService, AlternativeRankingService } from './transaction-ranking.service';
import { OptimizerWarningService } from './optimizer-warning.service';
import { OptimizerExplainabilityService } from './optimizer-explainability.service';

@Injectable()
export class OptimizerEngineService {
  private readonly logger = new Logger(OptimizerEngineService.name);

  constructor(
    @InjectRepository(CreditCardEntity)
    private readonly cardRepo: Repository<CreditCardEntity>,
    private readonly merchantRouter: MerchantRoutingService,
    private readonly simulator: TransactionSimulationService,
    private readonly ranker: TransactionRankingService,
    private readonly alternativeRanker: AlternativeRankingService,
    private readonly warningEngine: OptimizerWarningService,
    private readonly explainability: OptimizerExplainabilityService,
  ) {}

  async optimize(request: OptimizationRequest): Promise<OptimizationResult> {
    const requestId = crypto.randomUUID();
    const startTime = Date.now();

    // ── STEP 1 & 2: Merchant Routing ────────────────────────
    const route = await this.merchantRouter.route(request);

    // ── STEP 3: Load user's cards ───────────────────────────
    const userCards = await this.cardRepo.findByIds(request.userCardIds);

    if (userCards.length === 0) {
      return this.buildFallback(requestId, request, route, 'No cards found in user wallet.');
    }

    // ── STEPS 4–9: Simulate reward for each card ─────────────
    const simulations = await Promise.all(
      userCards.map(card => this.simulator.simulate(card, request, route))
    );

    // ── STEP 10: Rank ────────────────────────────────────────
    const rankedCards: RankedCard[] = this.ranker.rank(simulations);

    // ── STEP 11: Build alternatives ──────────────────────────
    const alternatives = this.alternativeRanker.buildAlternatives(rankedCards);

    // ── STEP 12: Warnings ────────────────────────────────────
    const globalWarnings = this.warningEngine.generate(rankedCards, route, request.amount);

    // ── STEP 13: Explainability trace ────────────────────────
    const trace = this.explainability.buildTrace(route, rankedCards, alternatives);

    // ── STEP 14: Confidence scoring ──────────────────────────
    const latencyMs = Date.now() - startTime;
    const avgConfidence = rankedCards.length > 0
      ? rankedCards.reduce((s, c) => s + c.confidenceScore, 0) / rankedCards.length
      : 0;
    const freshnessScore = latencyMs < 200 ? 100 : latencyMs < 500 ? 85 : 70;

    return {
      requestId,
      merchantName: request.merchantName,
      merchantCategory: route.resolvedCategory,
      amount: request.amount,
      currency: request.currency,
      bestCard: rankedCards[0] ?? null,
      allRankedCards: rankedCards,
      alternatives,
      globalWarnings,
      confidenceScore: Math.round(avgConfidence * (route.merchantConfidence / 100)),
      merchantConfidenceScore: route.merchantConfidence,
      ruleCoverageScore: rankedCards.some(c => c.appliedRules.length > 0) ? 100 : 50,
      freshnessScore,
      isFallback: false,
      optimizationTrace: trace,
      generatedAt: new Date(),
    };
  }

  private buildFallback(
    requestId: string,
    request: OptimizationRequest,
    route: any,
    reason: string,
  ): OptimizationResult {
    return {
      requestId,
      merchantName: request.merchantName,
      merchantCategory: route?.resolvedCategory ?? 'UNKNOWN',
      amount: request.amount,
      currency: request.currency,
      bestCard: null,
      allRankedCards: [],
      alternatives: [],
      globalWarnings: [reason],
      confidenceScore: 0,
      merchantConfidenceScore: route?.merchantConfidence ?? 0,
      ruleCoverageScore: 0,
      freshnessScore: 100,
      isFallback: true,
      fallbackReason: reason,
      optimizationTrace: [`[FALLBACK] ${reason}`],
      generatedAt: new Date(),
    };
  }
}
