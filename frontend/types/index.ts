// frontend/types/index.ts
export interface Document {
    id: string;
    filename: string;
    originalName: string;
    mimeType: string;
    size: number;
    uploadedAt: Date;
    chunkCount?: number;
  }
  
  export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    sources?: DocumentChunk[];
  }
  
  export interface DocumentChunk {
    id: string;
    documentId: string;
    content: string;
    chunkIndex: number;
    similarity?: number;
  }
  
  export interface ChatResponse {
    answer: string;
    sources: DocumentChunk[];
    conversationId?: string;
  }
  
  export interface UploadResponse {
    success: boolean;
    document?: Document;
    message?: string;
  }
  
  export interface ApiError {
    message: string;
    statusCode: number;
    error?: string;
  }