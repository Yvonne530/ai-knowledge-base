// backend/src/chat/dto/chat-request.dto.ts
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChatRequestDto {
  @ApiProperty({ description: '用户问题' })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiProperty({ description: '对话ID', required: false })
  @IsOptional()
  @IsString()
  conversationId?: string;
}

// backend/src/chat/dto/chat-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class DocumentChunkDto {
  @ApiProperty({ description: '文档块ID' })
  id: string;

  @ApiProperty({ description: '文档ID' })
  documentId: string;

  @ApiProperty({ description: '文本内容' })
  content: string;

  @ApiProperty({ description: '块索引' })
  chunkIndex: number;

  @ApiProperty({ description: '相似度分数', required: false })
  similarity?: number;
}

export class ChatResponseDto {
  @ApiProperty({ description: 'AI回答' })
  answer: string;

  @ApiProperty({ description: '参考来源', type: [DocumentChunkDto] })
  sources: DocumentChunkDto[];

  @ApiProperty({ description: '对话ID', required: false })
  conversationId?: string;
}