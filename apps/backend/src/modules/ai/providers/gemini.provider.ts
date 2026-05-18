import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import {
  IAIProvider,
  AIRequest,
  AIResponse,
  AIStreamChunk,
  AIProviderName,
} from '../interfaces/ai.interface';

@Injectable()
export class GeminiProvider implements IAIProvider {
  readonly name: AIProviderName = 'gemini';
  private readonly logger = new Logger(GeminiProvider.name);
  private client: GoogleGenerativeAI;
  private model: GenerativeModel;
  private readonly modelName = 'gemini-1.5-flash';

  constructor() {
    this.client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? '');
    this.model = this.client.getGenerativeModel({ model: this.modelName });
  }

  async isAvailable(): Promise<boolean> {
    if (!process.env.GEMINI_API_KEY) return false;
    try {
      await this.model.generateContent('ping');
      return true;
    } catch {
      return false;
    }
  }

  async chat(request: AIRequest): Promise<AIResponse> {
    const start = Date.now();

    const prompt = request.messages
      .map(m => `${m.role.toUpperCase()}: ${m.content}`)
      .join('\n\n');

    const result = await this.model.generateContent(prompt);
    const text = result.response.text();
    const latencyMs = Date.now() - start;

    return {
      content: text,
      provider: this.name,
      model: this.modelName,
      tokensUsed: this.countTokens(text),
      latencyMs,
      isFallback: false,
      isCached: false,
    };
  }

  async *streamChat(request: AIRequest): AsyncGenerator<AIStreamChunk> {
    const prompt = request.messages
      .map(m => `${m.role.toUpperCase()}: ${m.content}`)
      .join('\n\n');

    const result = await this.model.generateContentStream(prompt);

    for await (const chunk of result.stream) {
      const text = chunk.text();
      if (text) {
        yield { delta: text, isDone: false, provider: this.name };
      }
    }

    yield { delta: '', isDone: true, provider: this.name };
  }

  countTokens(text: string): number {
    // Rough approximation: ~4 chars per token
    return Math.ceil(text.length / 4);
  }
}
