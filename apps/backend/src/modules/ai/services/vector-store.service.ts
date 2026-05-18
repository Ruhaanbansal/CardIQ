import { Injectable, Logger } from '@nestjs/common';
import { ChromaClient, Collection } from 'chromadb';
import { EmbeddingsService } from './embeddings.service';
import { RAGDocument } from '../interfaces/ai.interface';

@Injectable()
export class VectorStoreService {
  private readonly logger = new Logger(VectorStoreService.name);
  private client: ChromaClient;
  private collection: Collection | null = null;
  private readonly COLLECTION_NAME = 'cardiq_knowledge';
  // In-memory fallback store
  private readonly memoryStore: { doc: RAGDocument; embedding: number[] }[] = [];
  private chromaAvailable = false;

  constructor(private readonly embeddingsService: EmbeddingsService) {
    this.client = new ChromaClient({
      path: process.env.CHROMA_URL ?? 'http://localhost:8000',
    });
    this.initialize();
  }

  private async initialize() {
    try {
      this.collection = await this.client.getOrCreateCollection({
        name: this.COLLECTION_NAME,
        metadata: { description: 'CardIQ knowledge base for RAG retrieval' },
      });
      this.chromaAvailable = true;
      this.logger.log('ChromaDB collection initialized.');
    } catch (err: any) {
      this.logger.warn(`ChromaDB unavailable: ${err.message}. Using in-memory vector store.`);
      this.chromaAvailable = false;
    }
  }

  async upsert(doc: RAGDocument): Promise<void> {
    const { embedding } = await this.embeddingsService.embed(doc.content);

    if (this.chromaAvailable && this.collection) {
      await this.collection.upsert({
        ids: [doc.id],
        documents: [doc.content],
        embeddings: [embedding],
        metadatas: [doc.metadata as any],
      });
    } else {
      // Memory fallback
      const existing = this.memoryStore.findIndex(s => s.doc.id === doc.id);
      if (existing >= 0) this.memoryStore.splice(existing, 1);
      this.memoryStore.push({ doc: { ...doc, embedding }, embedding });
    }
  }

  async search(query: string, topK = 5, threshold = 0.4): Promise<RAGDocument[]> {
    const { embedding: queryEmbedding } = await this.embeddingsService.embed(query);

    if (this.chromaAvailable && this.collection) {
      try {
        const results = await this.collection.query({
          queryEmbeddings: [queryEmbedding],
          nResults: topK,
        });

        return (results.ids[0] ?? []).map((id, i) => ({
          id,
          content: results.documents[0]?.[i] ?? '',
          metadata: (results.metadatas[0]?.[i] ?? {}) as any,
        }));
      } catch (err: any) {
        this.logger.warn(`ChromaDB query failed: ${err.message}. Falling back to memory.`);
      }
    }

    // Memory fallback — cosine similarity
    return this.memoryStore
      .map(s => ({
        doc: s.doc,
        score: this.embeddingsService.cosineSimilarity(queryEmbedding, s.embedding),
      }))
      .filter(r => r.score >= threshold)
      .sort((a, b) => b.score - a.score)
      .slice(0, topK)
      .map(r => r.doc);
  }

  async deleteDocument(id: string): Promise<void> {
    if (this.chromaAvailable && this.collection) {
      await this.collection.delete({ ids: [id] });
    }
    const idx = this.memoryStore.findIndex(s => s.doc.id === id);
    if (idx >= 0) this.memoryStore.splice(idx, 1);
  }
}
