// backend/src/chat/chat.service.ts
import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { VectorService } from '../vector/vector.service';
import { ChatRequestDto } from './dto/chat-request.dto';
import { ChatResponseDto } from './dto/chat-response.dto';
import OpenAI from 'openai';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);
  private openai: OpenAI;

  constructor(
    private prisma: PrismaService,
    private vectorService: VectorService,
    private configService: ConfigService,
  ) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
    });
  }

  /**
   * 处理聊天消息
   */
  async processMessage(chatRequest: ChatRequestDto): Promise<ChatResponseDto> {
    try {
      const { message, conversationId } = chatRequest;

      // 1. 在向量数据库中搜索相关文档块
      this.logger.log(`🔍 Searching for relevant content for: "${message}"`);
      const relevantChunks = await this.vectorService.searchSimilarChunks(message, 5);

      if (relevantChunks.length === 0) {
        return {
          answer: '抱歉，我在您上传的文档中没有找到相关信息。请确保您已经上传了相关文档，或者尝试用不同的方式描述您的问题。',
          sources: [],
          conversationId,
        };
      }

      // 2. 构建上下文
      const context = this.buildContext(relevantChunks);

      // 3. 构建 Prompt
      const prompt = this.buildPrompt(message, context);

      // 4. 调用 GPT 生成回答
      this.logger.log('🤖 Generating AI response...');
      const aiResponse = await this.generateAIResponse(prompt);

      // 5. 保存对话记录
      const finalConversationId = await this.saveConversation(
        conversationId,
        message,
        aiResponse,
        relevantChunks
      );

      this.logger.log('✅ Chat response generated successfully');

      return {
        answer: aiResponse,
        sources: relevantChunks,
        conversationId: finalConversationId,
      };
    } catch (error) {
      this.logger.error('Failed to process chat message:', error);
      throw new BadRequestException('Failed to process your message. Please try again.');
    }
  }

  /**
   * 构建上下文字符串
   */
  private buildContext(chunks: any[]): string {
    return chunks
      .map((chunk, index) => `[文档片段 ${index + 1}]\n${chunk.content}`)
      .join('\n\n');
  }

  /**
   * 构建 Prompt
   */
  private buildPrompt(question: string, context: string): string {
    return `你是一个专业的AI助手，专门帮助用户基于他们上传的文档内容回答问题。

**角色定义**:
- 你是一个知识渊博、准确可靠的AI文档助手
- 你只基于提供的文档内容回答问题，不添加额外信息
- 你会以清晰、专业且有帮助的方式回答问题

**回答指令**:
1. 仔细阅读提供的文档片段
2. 只基于这些文档内容回答用户问题
3. 如果文档中没有相关信息，明确说明
4. 回答要准确、简洁且有用
5. 使用 Markdown 格式让回答更易读
6. 必要时引用具体的文档片段

**文档内容**:
${context}

**用户问题**: ${question}

**回答要求**:
- 用中文回答
- 基于文档内容进行回答
- 结构清晰，使用适当的标题和列表
- 如果涉及多个方面，请分点说明

请基于上述文档内容回答用户的问题：`;
  }

  /**
   * 调用 OpenAI API 生成回答
   */
  private async generateAIResponse(prompt: string): Promise<string> {
    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: '你是一个专业的AI文档助手，基于用户上传的文档内容回答问题。',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 1000,
        temperature: 0.1, // 降低温度以获得更准确的回答
        top_p: 0.9,
      });

      return completion.choices[0]?.message?.content || '抱歉，我无法生成回答。';
    } catch (error) {
      this.logger.error('OpenAI API error:', error);
      throw new Error('Failed to generate AI response');
    }
  }

  /**
   * 保存对话记录
   */
  private async saveConversation(
    conversationId: string | undefined,
    userMessage: string,
    aiResponse: string,
    sources: any[]
  ): Promise<string> {
    try {
      let conversation;

      if (conversationId) {
        // 查找现有对话
        conversation = await this.prisma.conversation.findUnique({
          where: { id: conversationId }
        });
      }

      if (!conversation) {
        // 创建新对话
        conversation = await this.prisma.conversation.create({
          data: {}
        });
      }

      // 保存用户消息
      await this.prisma.chatMessage.create({
        data: {
          conversationId: conversation.id,
          role: 'user',
          content: userMessage,
        }
      });

      // 保存AI回答
      await this.prisma.chatMessage.create({
        data: {
          conversationId: conversation.id,
          role: 'assistant',
          content: aiResponse,
          sources: sources.map(source => ({
            id: source.id,
            documentId: source.documentId,
            chunkIndex: source.chunkIndex,
            similarity: source.similarity,
          })),
        }
      });

      return conversation.id;
    } catch (error) {
      this.logger.error('Failed to save conversation:', error);
      // 不抛出错误，因为这不影响核心功能
      return conversationId || 'temp-conversation';
    }
  }

  /**
   * 获取对话历史
   */
  async getConversation(conversationId: string) {
    const messages = await this.prisma.chatMessage.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' }
    });

    return messages.map(msg => ({
      id: msg.id,
      role: msg.role,
      content: msg.content,
      sources: msg.sources,
      timestamp: msg.createdAt,
    }));
  }

  /**
   * 获取所有对话
   */
  async getConversations() {
    return await this.prisma.conversation.findMany({
      include: {
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });
  }
}