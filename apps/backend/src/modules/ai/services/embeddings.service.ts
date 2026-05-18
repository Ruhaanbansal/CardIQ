import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { EmbeddingResult } from '../interfaces/ai.interface';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Inject } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class EmbeddingsService {
  private readonly logger = new Logger(EmbeddingsService.name);
  // HuggingFace Inference API — sentence-transformers/all-MiniLM-L6-v2
  private readonly HF_API_URL =
    'https://api-inference.huggingface.co/pipeline/feature-extraction/sentence-transformers/all-MiniLM-L6-v2';
  private readonly model = 'sentence-transformers/all-MiniLM-L6-v2';

  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}

  async embed(text: string): Promise<EmbeddingResult> {
    const cacheKey = `embedding:${crypto.createHash('md5').update(text).digest('hex')}`;
    const cached = await this.cacheManager.get<number[]>(cacheKey);

    if (cached) {
      return { text, embedding: cached, model: this.model, cacheHit: true };
    }

    const embedding = await this.callHuggingFace(text);
    await this.cacheManager.set(cacheKey, embedding, 86400000); // 24h TTL

    return { text, embedding, model: this.model, cacheHit: false };
  }

  async embedBatch(texts: string[]): Promise<EmbeddingResult[]> {
    // Deduplicate + check cache for each
    return Promise.all(texts.map(t => this.embed(t)));
  }

  private async callHuggingFace(text: string): Promise<number[]> {
    const hfKey = process.env.HUGGINGFACE_API_KEY;

    if (hfKey) {
      try {
        const res = await axios.post(
          this.HF_API_URL,
          { inputs: text },
          {
            headers: { Authorization: `Bearer ${hfKey}` },
            timeout: 10000,
          },
        );
        return res.data;
      } catch (err: any) {
        this.logger.warn(`HuggingFace API failed: ${err.message}. Using local fallback.`);
      }
    }

    // Local fallback: deterministic bag-of-words sparse embedding (384-dim)
    return this.localFallbackEmbed(text);
  }

  private localFallbackEmbed(text: string): number[] {
    const dim = 384;
    const result = new Array(dim).fill(0);
    const tokens = text.toLowerCase().split(/\s+/);
    for (const token of tokens) {
      let hash = 0;
      for (let i = 0; i < token.length; i++) {
        hash = (hash * 31 + token.charCodeAt(i)) % dim;
      }
      result[Math.abs(hash)] += 1 / tokens.length;
    }
    return result;
  }

  cosineSimilarity(a: number[], b: number[]): number {
    let dot = 0, normA = 0, normB = 0;
    for (let i = 0; i < a.length; i++) {
      dot += a[i] * b[i];
      normA += a[i] ** 2;
      normB += b[i] ** 2;
    }
    const denom = Math.sqrt(normA) * Math.sqrt(normB);
    return denom === 0 ? 0 : dot / denom;
  }
}
