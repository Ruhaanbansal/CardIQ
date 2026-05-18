// ============================================================
// CARDIQ AI MODULE — CORE INTERFACES
// ============================================================

export type AIProviderName = 'gemini' | 'groq' | 'ollama' | 'openrouter';
export type AIRoutingStrategy = 'quality-first' | 'speed-first';
export type AIRequestType = 'chat' | 'optimizer-explanation' | 'recommendation-summary' | 'merchant-category' | 'comparison' | 'article-summary';

export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AIRequest {
  type: AIRequestType;
  messages: AIMessage[];
  stream?: boolean;
  maxTokens?: number;
  temperature?: number;
  userId?: string;
  sessionId?: string;
  routingStrategy?: AIRoutingStrategy;
}

export interface AIResponse {
  content: string;
  provider: AIProviderName;
  model: string;
  tokensUsed: number;
  latencyMs: number;
  isFallback: boolean;
  isCached: boolean;
  fallbackReason?: string;
}

export interface AIStreamChunk {
  delta: string;
  isDone: boolean;
  provider: AIProviderName;
}

export interface ProviderHealth {
  provider: AIProviderName;
  isHealthy: boolean;
  latencyMs: number;
  lastCheckedAt: Date;
  errorMessage?: string;
}

// ── RAG Interfaces ────────────────────────────────────────────
export interface RAGDocument {
  id: string;
  content: string;
  metadata: {
    source: string;         // 'card_description' | 'reward_rule' | 'faq' | 'article'
    cardId?: string;
    merchantId?: string;
    tags?: string[];
  };
  embedding?: number[];
}

export interface RAGContext {
  query: string;
  retrievedDocuments: RAGDocument[];
  relevanceScores: number[];
  retrievalMethod: 'vector' | 'hybrid' | 'keyword';
}

export interface EmbeddingResult {
  text: string;
  embedding: number[];
  model: string;
  cacheHit: boolean;
}

// ── AI Provider Abstraction ───────────────────────────────────
export interface IAIProvider {
  name: AIProviderName;
  isAvailable(): Promise<boolean>;
  chat(request: AIRequest): Promise<AIResponse>;
  streamChat(request: AIRequest): AsyncGenerator<AIStreamChunk>;
  countTokens(text: string): number;
}

// ── Context Builder Inputs ────────────────────────────────────
export interface OptimizerExplanationContext {
  merchantName: string;
  amount: number;
  bestCardName: string;
  effectiveRate: number;
  appliedRules: string[];
  warnings: string[];
  alternatives: { cardName: string; tradeoffNote: string }[];
}

export interface RecommendationSummaryContext {
  primaryCardName: string;
  estimatedYearlySavings: number;
  effectiveRewardRate: number;
  feeAdjustedSavings: number;
  reasonings: string[];
  warnings: string[];
  stackSynergy?: string;
}
