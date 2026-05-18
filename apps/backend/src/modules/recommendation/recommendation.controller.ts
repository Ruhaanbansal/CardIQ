import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { RecommendationEngineService } from './services/recommendation-engine.service';
import { ApprovalProbabilityService } from './services/approval-probability.service';
import { SpendingProfile } from './interfaces/recommendation.interface';

@Controller('recommendation')
export class RecommendationController {
  constructor(
    private readonly recommendationEngine: RecommendationEngineService,
    private readonly approvalService: ApprovalProbabilityService,
  ) {}

  /**
   * POST /api/recommendation/generate
   * Main recommendation endpoint — full 11-step flow.
   */
  @HttpCode(HttpStatus.OK)
  @Post('generate')
  async generate(@Body() profile: SpendingProfile) {
    return this.recommendationEngine.generate(profile);
  }

  /**
   * POST /api/recommendation/stack
   * Returns just the optimal 2-card stack for a profile.
   */
  @HttpCode(HttpStatus.OK)
  @Post('stack')
  async getStack(@Body() profile: SpendingProfile) {
    const result = await this.recommendationEngine.generate(profile);
    return {
      stack: result.optimizedStack,
      overlapWarnings: result.overlapWarnings,
      confidenceScore: result.confidenceScore,
    };
  }

  /**
   * POST /api/recommendation/compare
   * Compare profile against all ranked cards, returns sorted list.
   */
  @HttpCode(HttpStatus.OK)
  @Post('compare')
  async compare(@Body() profile: SpendingProfile) {
    const result = await this.recommendationEngine.generate(profile);
    return {
      rankedCards: result.allRankedCards,
      confidenceScore: result.confidenceScore,
      profileHash: result.profileHash,
    };
  }
}
