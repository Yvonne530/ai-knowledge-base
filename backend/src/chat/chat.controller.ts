// backend/src/chat/chat.controller.ts
import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { ChatRequestDto } from './dto/chat-request.dto';
import { ChatResponseDto } from './dto/chat-response.dto';

@ApiTags('chat')
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  @ApiOperation({ summary: 'AI问答' })
  @ApiBody({ type: ChatRequestDto })
  @ApiResponse({ 
    status: 201, 
    description: '成功获得AI回答',
    type: ChatResponseDto 
  })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  async chat(@Body() chatRequest: ChatRequestDto): Promise<ChatResponseDto> {
    return await this.chatService.processMessage(chatRequest);
  }

  @Get('conversations')
  @ApiOperation({ summary: '获取所有对话' })
  @ApiResponse({ status: 200, description: '成功获取对话列表' })
  async getConversations() {
    return await this.chatService.getConversations();
  }

  @Get('conversations/:id')
  @ApiOperation({ summary: '获取对话详情' })
  @ApiResponse({ status: 200, description: '成功获取对话详情' })
  @ApiResponse({ status: 404, description: '对话不存在' })
  async getConversation(@Param('id') id: string) {
    return await this.chatService.getConversation(id);
  }
}

// backend/src/chat/chat.module.ts
import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { VectorModule } from '../vector/vector.module';

@Module({
  imports: [VectorModule],
  controllers: [ChatController],
  providers: [ChatService],
})
export class ChatModule {}