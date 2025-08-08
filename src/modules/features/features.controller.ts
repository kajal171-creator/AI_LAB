import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Headers,
  Post,
  HttpCode,
  HttpStatus,
  UploadedFiles,
  Req,
} from '@nestjs/common';
import { RagChatbotService } from './services/rag-chatbot.service';
import { CreateRagChatDto } from './dto/rag-chat.dto';
import {
  ApiTags,
  ApiResponse,
  ApiSecurity,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CreateKnowledgeDto } from './dto/create-knowledge.dto';
import { UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiBody } from '@nestjs/swagger';
import { ResponseMessages } from 'src/common/constants/response-message.constants';
import { UseGuards } from '@nestjs/common';
import { ClientAuthGuard } from 'src/common/guards/client-auth.guard';
import { JwtHelper } from 'src/common/helpers/jwt.helper';
import { Knowledge } from 'src/entities/knowledge.entity';
import { Conversation } from 'src/entities/conversation.entity';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { CreateMessageDto } from './dto/create-message.dto';
import { Message } from 'src/entities/message.entity';

@ApiTags('RAG Chatbot')
@Controller('chat')
export class FeaturesController {
  constructor(private readonly ragChatService: RagChatbotService) {}

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post('conversation')
  async createConversation(
    @Body() body: CreateConversationDto,
    @Req() req: Request,
    @Headers('x-client-type') clientType: string,
  ): Promise<string> {
    return this.ragChatService.createConversation(body, req['user'].id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('all-conversation')
  @ApiResponse({
    status: 200,
    description: 'List of all conversation documents',
    type: [Conversation],
  })
  async listAllConversations(
    @Req() req: Request,
    @Headers('x-client-type') clientType: string,
  ): Promise<Conversation[]> {
    return this.ragChatService.getAllConversations(req['user'].id);
  }

  // @UseGuards(ClientAuthGuard)
  // @Get('conversation')
  // @ApiResponse({
  //   status: 200,
  //   description: ResponseMessages.RAG.GET_CONVERSATION,
  // })
  // async getMessages(@Param('id') userId: string) {
  //   return this.ragChatService.getConversations(userId);
  // }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post('message')
  async createMessage(
    @Body() body: CreateMessageDto,
    @Req() req: Request,
    @Headers('x-client-type') clientType: string,
  ): Promise<string> {
    return this.ragChatService.createMessage(body, req['user'].id);
  }

  // @UseGuards(ClientAuthGuard)
  // @Delete('conversation/:id')
  // async deleteConversation(
  //   @Param('id') conversationId: string,
  //   @Body() body: { userId: string },
  // ) {
  //   return this.ragChatService.deleteConversation(conversationId, body.userId);
  // }

  ////////////////////
  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post('upload-pdf')
  @UseInterceptors(FilesInterceptor('files'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: ResponseMessages.RAG.FILE_UPLOADED,
  })
  async uploadPdf(
    @Headers('x-client-type') clientType: string,
    @UploadedFiles() files: Express.Multer.File[],
    @Req() req: Request,
  ) {
    return this.ragChatService.uploadPdf(files, req['user'].id);
  }
  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('all-knowledge')
  @ApiResponse({
    status: 200,
    description: 'List of all knowledge documents',
    type: [Knowledge],
  })
  async listAllKnowledge(
    @Req() req: Request,
    @Headers('x-client-type') clientType: string,
  ): Promise<Knowledge[]> {
    return this.ragChatService.getAllKnowledge(req['user'].id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('conversation/:conversationId/messages')
  @ApiResponse({
    status: 200,
    description:
      'List of all messages in the conversation ordered by createdAt',
    type: [Message],
  })
  async getAllMessagesByConversation(
    @Param('conversationId') conversationId: string,
    @Req() req: Request,
    @Headers('x-client-type') clientType: string,
  ) {
    return this.ragChatService.getAllChatsByConversation(
      conversationId,
      req['user'].id,
    );
  }
}
