import {Body,Controller,Delete,Get,Param,Post,HttpCode, HttpStatus} from '@nestjs/common';
import { RagChatService } from './services/rag-chatbot.service';
import { CreateRagChatDto } from './dto/rag-chat.dto';
import { ApiTags, ApiResponse } from '@nestjs/swagger';
import { CreateKnowledgeDto } from './dto/create-knowledge.dto';
import { UseInterceptors,UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiConsumes,ApiBody} from '@nestjs/swagger';
import { ResponseMessages } from 'src/common/constants/response-message.constants';


@ApiTags('RAG Chatbot')
@Controller('chat')
export class FeaturesController {
  constructor(private readonly ragChatService: RagChatService) {}

  @Post('message')
  @ApiResponse({ status: 201, description: ResponseMessages.RAG.MESSAGE_CREATED })
  async createMessage(@Body() createDto: CreateRagChatDto) {
    return this.ragChatService.createMessage(createDto);
  }

  @Post('conversation')
  @ApiResponse({ status: 201, description: ResponseMessages.RAG.MESSAGE_CREATED })
  async createConversation(@Body() body: { userId: string }) {
    return this.ragChatService.createConversation(body.userId);
  }

  @Get('conversation')
  @ApiResponse({ status: 200, description: ResponseMessages.RAG.GET_CONVERSATION})
  async getMessages(@Param('id') userId: string) {
    return this.ragChatService.getConversation(userId);
  }

  @Delete('conversation/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponse({ status: 200, description: ResponseMessages.RAG.DELETE_CONVERSATION })
  async deleteConversation(@Param('id') conversationId: string) {
    return this.ragChatService.deleteConversation(conversationId);
  }

  @Post('upload-pdf')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({schema: {type: 'object',properties: {file: { type: 'string',format: 'binary',},},},})
  @ApiResponse({ status: 201, description: ResponseMessages.RAG.FILE_UPLOADED })
  async uploadPdf(
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.ragChatService.uploadPdf(file);
  }
}
