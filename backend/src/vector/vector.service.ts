// backend/src/vector/vector.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChromaClient } from 'chromadb';
import OpenAI from 'openai';

export interface DocumentChunk {
  id: string;
  content: string;
  chunkIndex: number;
  documentId: string;
  similarity?: number;
}

@Injectable()
export class VectorService {
  private readonly logger = new Logger(VectorService.name);
  private openai: OpenAI;
  private chroma: ChromaClient;
  private collection: any;

  constructor(private configService: ConfigService) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
    });

    this.chroma = new ChromaClient({
      path: this.configService.get<string>('CHROMA_URL') || 'http://localhost:8000',
    });

    this.initializeCollection();
  }

  private async initializeCollection() {
    try {
      this.collection = await this.chroma.getOrCreateCollection({
        name: 'documents',
        metadata: { 'hnsw:space': 'cosine' }
      });
      this.logger.log('✅ ChromaDB collection initialized');
    } catch (error) {
      this.logger.error('❌ Failed to initialize ChromaDB collection:', error);
    }
  }

  /**
   * 将文本转换为向量
   */
  async createEmbedding(text: string): Promise<number[]> {
    try {
      const response = await this.openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: text,
      });

      return response.data[0].embedding;
    } catch (error) {
      this.logger.error('Failed to create embedding:', error);
      throw new Error('Failed to create text embedding');
    }
  }

  /**
   * 将文档分块
   */
  chunkText(text: string, chunkSize = 1000, overlap = 200): string[] {
    const chunks: string[] = [];
    let start = 0;

    while (start < text.length) {
      const end = Math.min(start + chunkSize, text.length);
      const chunk = text.slice(start, end);
      
      // 尝试在句号、感叹号或问号处分割
      if (end < text.length) {
        const lastSentenceEnd = Math.max(
          chunk.lastIndexOf('.'),
          chunk.lastIndexOf('!'),
          chunk.lastIndexOf('?'),
          chunk.lastIndexOf('。')
        );
        
        if (lastSentenceEnd > chunk.length * 0.5) {
          chunks.push(chunk.slice(0, lastSentenceEnd + 1));
          start += lastSentenceEnd + 1;
        } else {
          chunks.push(chunk);
          start += chunkSize - overlap;
        }
      } else {
        chunks.push(chunk);
        break;
      }
    }

    return chunks.filter(chunk => chunk.trim().length > 0);
  }

  /**
   * 存储文档块到向量数据库
   */
  async storeDocumentChunks(
    documentId: string,
    chunks: string[]
  ): Promise<void> {
    try {
      const embeddings: number[][] = [];
      const ids: string[] = [];
      const metadatas: any[] = [];
      const documents: string[] = [];

      for (let i = 0; i < chunks.length; i++) {
        const chunkId = `${documentId}_chunk_${i}`;
        const embedding = await this.createEmbedding(chunks[i]);
        
        embeddings.push(embedding);
        ids.push(chunkId);
        metadatas.push({
          documentId,
          chunkIndex: i,
          length: chunks[i].length,
        });
        documents.push(chunks[i]);
      }

      await this.collection.add({
        ids,
        embeddings,
        metadatas,
        documents,
      });

      this.logger.log(`✅ Stored ${chunks.length} chunks for document ${documentId}`);
    } catch (error) {
      this.logger.error('Failed to store document chunks:', error);
      throw new Error('Failed to store document in vector database');
    }
  }

  /**
   * 搜索相似文档块
   */
  async searchSimilarChunks(
    query: string,
    topK = 5
  ): Promise<DocumentChunk[]> {
    try {
      const queryEmbedding = await this.createEmbedding(query);
      
      const results = await this.collection.query({
        queryEmbeddings: [queryEmbedding],
        nResults: topK,
        include: ['documents', 'metadatas', 'distances'],
      });

      if (!results.documents || !results.documents[0]) {
        return [];
      }

      const chunks: DocumentChunk[] = [];
      const documents = results.documents[0];
      const metadatas = results.metadatas[0];
      const distances = results.distances[0];

      for (let i = 0; i < documents.length; i++) {
        const metadata = metadatas[i];
        chunks.push({
          id: `${metadata.documentId}_chunk_${metadata.chunkIndex}`,
          content: documents[i],
          chunkIndex: metadata.chunkIndex,
          documentId: metadata.documentId,
          similarity: 1 - distances[i], // Convert distance to similarity
        });
      }

      return chunks;
    } catch (error) {
      this.logger.error('Failed to search similar chunks:', error);
      throw new Error('Failed to search in vector database');
    }
  }

  /**
   * 删除文档的所有块
   */
  async deleteDocumentChunks(documentId: string): Promise<void> {
    try {
      // ChromaDB 不支持直接按 metadata 删除，需要先查询再删除
      const results = await this.collection.get({
        where: { documentId },
      });

      if (results.ids && results.ids.length > 0) {
        await this.collection.delete({
          ids: results.ids,
        });
        
        this.logger.log(`✅ Deleted chunks for document ${documentId}`);
      }
    } catch (error) {
      this.logger.error('Failed to delete document chunks:', error);
      throw new Error('Failed to delete document from vector database');
    }
  }
}

// backend/src/vector/vector.module.ts
import { Module } from '@nestjs/common';
import { VectorService } from './vector.service';

@Module({
  providers: [VectorService],
  exports: [VectorService],
})
export class VectorModule {}