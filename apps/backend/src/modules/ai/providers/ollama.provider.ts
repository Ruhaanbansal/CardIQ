import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import {
  IAIProvider,
  AIRequest,
  AIResponse,
  AIStreamChunk,
  AIProviderName,
} from '../interfaces/ai.interface';

@Injectable()
export class OllamaProvider implements IAIProvider {
  readonly name: AIProviderName = 'ollama';
  private readonly logger = new Logger(OllamaProvider.name);
  private readonly baseUrl: string;
  private readonly modelName: string;

  constructor() {
    this.baseUrl = process.env.OLLAMA_BASE_URL ?? 'http://localhost:11434';
    this.modelName = process.env.OLLAMA_MODEL ?? 'mistral';
  }

  async isAvailable(): Promise<boolean> {
    try {
      await axios.get(`${this.baseUrl}/api/tags`, { timeout: 2000 });
      return true;
    } catch {
      return false;
    }
  }

  async chat(request: AIRequest): Promise<AIResponse> {
    const start = Date.now();

    const prompt = request.messages.map(m => m.content).join('\n\n');

    const res = await axios.post(
      `${this.baseUrl}/api/generate`,
      { model: this.modelName, prompt, stream: false },
      { timeout: 30000 },
    );

    const content = res.data.response ?? '';
    return {
      content,
      provider: this.name,
      model: this.modelName,
      tokensUsed: this.countTokens(content),
      latencyMs: Date.now() - start,
      isFallback: true,
      isCached: false,
      fallbackReason: 'Using local Ollama fallback model.',
    };
  }

  async *streamChat(request: AIRequest): AsyncGenerator<AIStreamChunk> {
    const prompt = request.messages.map(m => m.content).join('\n\n');

    const res = await axios.post(
      `${this.baseUrl}/api/generate`,
      { model: this.modelName, prompt, stream: true },
      { responseType: 'stream', timeout: 60000 },
    );

    let buffer = '';
    for await (const chunk of res.data) {
      buffer += chunk.toString();
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';
      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const json = JSON.parse(line);
          yield {
            delta: json.response ?? '',
            isDone: json.done ?? false,
            provider: this.name,
          };
        } catch { /* ignore malformed */ }
      }
    }
  }

  countTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }
}
