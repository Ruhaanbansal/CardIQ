import { Injectable, Logger } from '@nestjs/common';
import { Response } from 'express';
import { AIStreamChunk, AIProviderName } from '../interfaces/ai.interface';
import { AIRouterService } from './ai-router.service';
import { AIRequest } from '../interfaces/ai.interface';

@Injectable()
export class StreamingService {
  private readonly logger = new Logger(StreamingService.name);

  constructor(private readonly router: AIRouterService) {}

  /**
   * Streams a Server-Sent Events response to the HTTP response object.
   * Handles provider fallback, partial failures, and clean shutdown.
   */
  async streamSSE(request: AIRequest, res: Response): Promise<void> {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // Disable Nginx buffering

    let totalTokens = 0;
    let activeProvider: AIProviderName = 'gemini';

    try {
      for await (const chunk of this.router.routeStream(request)) {
        if (!chunk.isDone) {
          activeProvider = chunk.provider;
          totalTokens += Math.ceil(chunk.delta.length / 4);

          const payload = JSON.stringify({ delta: chunk.delta, provider: chunk.provider });
          res.write(`data: ${payload}\n\n`);
        }
      }

      // Send completion event
      const donePayload = JSON.stringify({
        done: true,
        provider: activeProvider,
        tokensUsed: totalTokens,
      });
      res.write(`data: ${donePayload}\n\n`);
    } catch (err: any) {
      this.logger.error(`Streaming error: ${err.message}`);
      const errPayload = JSON.stringify({
        error: 'Stream interrupted. Please retry.',
        done: true,
      });
      res.write(`data: ${errPayload}\n\n`);
    } finally {
      res.end();
    }
  }
}
