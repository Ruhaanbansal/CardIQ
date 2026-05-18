import { Injectable, Logger } from '@nestjs/common';
import { VectorStoreService } from './vector-store.service';
import { RAGContext, RAGDocument } from '../interfaces/ai.interface';

@Injectable()
export class RAGService {
  private readonly logger = new Logger(RAGService.name);

  constructor(private readonly vectorStore: VectorStoreService) {}

  /**
   * Retrieves contextually relevant documents for the given query.
   * Returns a RAGContext ready to be injected into a prompt.
   */
  async retrieve(query: string, topK = 4): Promise<RAGContext> {
    let retrievedDocuments: RAGDocument[] = [];
    let method: RAGContext['retrievalMethod'] = 'vector';

    try {
      retrievedDocuments = await this.vectorStore.search(query, topK, 0.35);
    } catch (err: any) {
      this.logger.warn(`Vector retrieval failed: ${err.message}. Returning empty context.`);
      method = 'keyword'; // Signal degraded mode
    }

    // Relevance scores are positional for now (would use actual cosine scores in full impl)
    const relevanceScores = retrievedDocuments.map((_, i) => 1 - i * 0.1);

    return {
      query,
      retrievedDocuments,
      relevanceScores,
      retrievalMethod: method,
    };
  }

  /**
   * Formats retrieved documents into a prompt-injectable context block.
   */
  formatContext(ctx: RAGContext): string {
    if (ctx.retrievedDocuments.length === 0) {
      return 'No relevant knowledge base documents were found for this query.';
    }

    return ctx.retrievedDocuments
      .map((doc, i) =>
        `[Source ${i + 1} — ${doc.metadata.source}]\n${doc.content}`
      )
      .join('\n\n---\n\n');
  }

  /**
   * Index a new document into the knowledge base.
   */
  async indexDocument(doc: RAGDocument): Promise<void> {
    await this.vectorStore.upsert(doc);
    this.logger.log(`Indexed document: ${doc.id} (source: ${doc.metadata.source})`);
  }
}
