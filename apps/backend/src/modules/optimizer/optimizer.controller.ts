import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { OptimizerEngineService } from './services/optimizer-engine.service';
import { BatchOptimizerService } from './services/batch-optimizer.service';
import { OptimizationRequest } from './interfaces/optimizer.interface';

@Controller('optimizer')
export class OptimizerController {
  constructor(
    private readonly engine: OptimizerEngineService,
    private readonly batchEngine: BatchOptimizerService,
  ) {}

  /**
   * POST /api/optimizer/suggest
   * Core endpoint — "Which card should I use right now?"
   */
  @HttpCode(HttpStatus.OK)
  @Post('suggest')
  async suggest(@Body() request: OptimizationRequest) {
    return this.engine.optimize(request);
  }

  /**
   * POST /api/optimizer/batch
   * Optimize an array of transactions at once.
   */
  @HttpCode(HttpStatus.OK)
  @Post('batch')
  async batch(@Body() requests: OptimizationRequest[]) {
    return this.batchEngine.optimizeBatch(requests);
  }

  /**
   * POST /api/optimizer/alternatives
   * Returns only the ranked alternatives for a transaction.
   */
  @HttpCode(HttpStatus.OK)
  @Post('alternatives')
  async alternatives(@Body() request: OptimizationRequest) {
    const result = await this.engine.optimize(request);
    return {
      bestCard: result.bestCard,
      alternatives: result.alternatives,
      confidenceScore: result.confidenceScore,
      warnings: result.globalWarnings,
    };
  }

  /**
   * POST /api/optimizer/simulate
   * Returns full trace for debugging/explanation purposes.
   */
  @HttpCode(HttpStatus.OK)
  @Post('simulate')
  async simulate(@Body() request: OptimizationRequest) {
    const result = await this.engine.optimize(request);
    return {
      ...result,
      // Include full trace and all ranked cards for simulation/debug mode
      allRankedCards: result.allRankedCards,
      optimizationTrace: result.optimizationTrace,
    };
  }
}
