import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  HttpCode,
  HttpStatus,
  UploadedFiles,
} from '@nestjs/common';
import { RagChatbotService } from './services/rag-chatbot.service';
import { CreateRagChatDto } from './dto/rag-chat.dto';
import { ApiTags, ApiResponse } from '@nestjs/swagger';
import { CreateKnowledgeDto } from './dto/create-knowledge.dto';
import { UseInterceptors } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiBody } from '@nestjs/swagger';
import { ResponseMessages } from 'src/common/constants/response-message.constants';
import { UseGuards } from '@nestjs/common';
import { ClientAuthGuard } from 'src/common/guards/client-auth.guard';

@ApiTags('RAG Chatbot')
@Controller('chat')
export class FeaturesController {
  constructor(private readonly ragChatService: RagChatbotService) {}

  @UseGuards(ClientAuthGuard)
  @Post('message')
  async createMessage(@Body() createDto: CreateRagChatDto) {
    const { conversationId, senderId, content } = createDto;
    return this.ragChatService.createMessage(conversationId, senderId, content);
  }

  @UseGuards(ClientAuthGuard)
  @Post('conversation')
  async createConversation(@Body() body: { userId: string; title: string }) {
    return this.ragChatService.createConversation(body.title, body.userId);
  }

  @UseGuards(ClientAuthGuard)
  @Get('conversation')
  @ApiResponse({
    status: 200,
    description: ResponseMessages.RAG.GET_CONVERSATION,
  })
  async getMessages(@Param('id') userId: string) {
    return this.ragChatService.getConversations(userId);
  }

  @UseGuards(ClientAuthGuard)
  @Delete('conversation/:id')
  async deleteConversation(
    @Param('id') conversationId: string,
    @Body() body: { userId: string },
  ) {
    return this.ragChatService.deleteConversation(conversationId, body.userId);
  }

  @UseGuards(ClientAuthGuard)
  @Post('upload-pdf')
  @UseInterceptors(FilesInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  @ApiResponse({ status: 201, description: ResponseMessages.RAG.FILE_UPLOADED })
  async uploadPdf(@UploadedFiles() files: Express.Multer.File[]) {
    return this.ragChatService.uploadPdf(files);
  }
}
