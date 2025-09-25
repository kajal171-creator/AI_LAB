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
  BadRequestException,
  Res,
  Query,
  Patch,
} from '@nestjs/common';
import { RagChatbotService } from './services/rag-chatbot.service';
import { CreateRagChatDto } from './dto/rag-chat.dto';
import {
  ApiTags,
  ApiResponse,
  ApiSecurity,
  ApiBearerAuth,
  getSchemaPath,
  ApiExtraModels,
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
import { CreateResumeAnalysisDto } from './dto/create-resume-analysis.dto';
import { table } from 'console';
import { ResumeAnalysis } from 'src/entities/resume-analysis.entity';
import { ResumeAnalysisService } from './services/resume-checker.service';
import { GOOGLE_REGEX, GOOGLE_URLS } from 'src/common/constants/constants';
import { CreateTranslationDto } from './dto/create-translation.dto';
import { TranslatorService } from './services/translator.service';
import { Translation } from 'src/entities/translation.entity';
import { ClientProfilingService } from './services/client-profiling.service';
import { CreateMeetingDto } from './dto/client-profiling.dto';
import { ClientProfiling } from 'src/entities/client-profiling.entity';
import { CreateRagEvaluationDto } from './dto/create-rag-evaluation.dto';
import { RunService } from './services/stock-agent.service';
import { CreateRunDto } from './dto/stock-agent.dto';

const RESUME_ANALYZER_ENDPOINT = '/analyze-resumes';

@ApiTags('RAG Chatbot')
@Controller('chat')
export class FeaturesController {
  constructor(
    
    private readonly ragChatService: RagChatbotService,
    private readonly ragTranslatorService: TranslatorService,
  ) {}

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

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post('/evaluate')
  @HttpCode(HttpStatus.CREATED)
  @ApiBody({ type: CreateRagEvaluationDto })
  @ApiResponse({
    status: 201,
    description: 'RAG evaluation created successfully.',
  })
  async createRagEvaluation(
    @Req() req: Request,
    @Headers('x-client-type') clientType: string,
    @Body() createRagEvaluationDto: CreateRagEvaluationDto,
  ) {
    return this.ragChatService.createRagEvaluation(createRagEvaluationDto);
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

  // TRANSLATOR ENDPOINTS =============================================================================
  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post('translate')
  @HttpCode(HttpStatus.CREATED)
  async createTranslation(
    @Body() body: CreateTranslationDto,
    @Req() req: Request,
    @Headers('x-client-type') clientType: string,
  ) {
    return this.ragTranslatorService.createTranslation(body, req['user'].id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('all-translations')
  @ApiResponse({
    status: 200,
    description: 'List of all Translations',
  })
  async listAllTranslation(
    @Req() req: Request,
    @Headers('x-client-type') clientType: string,
  ): Promise<Translation[]> {
    return this.ragTranslatorService.getTranslations(req['user'].id);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  async deleteTranslation(
    @Param('id') translationId: string,
    @Req() req: Request,
  ) {
    const updatedTranslationList = await this.ragTranslatorService.deleteTranslationById(
      req['user'].id,
      translationId,
    );
    return {
      message: 'Translation deleted successfully',
      translations: updatedTranslationList,
    };
  }
}


@ApiTags('Resume Analysis')
@Controller('resume')
@UseGuards(ClientAuthGuard)
export class ResumeAnalysisController {
  constructor(
    private readonly ragChatService: RagChatbotService,
    private readonly resumeAnalysisService: ResumeAnalysisService,
  ) {}

  @ApiBearerAuth()
  @Post('analyze-resume')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FilesInterceptor('files'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
  description: 'Job description, resume links, and resume files to analyze.',
  schema: {
    type: 'object',
    properties: {
      description: {
        type: 'string',
        example: 'A job description for a software engineer...'
      },
      resumeLink: {
        type: 'array',
        items: { type: 'string', example: 'https://docs.google.com/document/d/your_doc_id/edit' },
        description: 'Links to resumes (Google Docs, Drive, etc.)',
      },
      files: {
        type: 'array',
        items: {
          type: 'string',
          format: 'binary'
        },
        description: 'Upload resume files like PDF, DOC, etc.'
      }
    },
    required: ['description']
  }
})

  @ApiResponse({
    status: 200,
    description: 'The resumes have been successfully analyzed.',
  })
  // 
  

async analyzeResume(
  @UploadedFiles() files: Express.Multer.File[],
  @Body() body: CreateResumeAnalysisDto,
  @Headers('x-client-type') clientType: string,
  @Req() req: Request,
) {
  let resumeLinks: string[] = [];

  if (body.resumeLink && body.resumeLink.length > 0) {
    resumeLinks = body.resumeLink.map((link) =>
      this.resumeAnalysisService.convertToExportLink(link),
    );
  }

  if ((!files || files.length === 0) && resumeLinks.length === 0) {
    throw new BadRequestException(ResponseMessages.RESUME.MISSING_RESUME);
  }

  const result = await this.resumeAnalysisService.analyzeResumes(
    {
      description: body.description,
      resumeLink: resumeLinks,
      files,
    },
    req['user'].id,
  );

  return {
    message: ResponseMessages.RESUME.ANALYSIS_SUCCESS,
    data: result,
  };
}



  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('all-analyses')
  @ApiResponse({
    status: 200,
    description: 'List of all resume analysis documents',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: ResponseMessages.RESUME.FETCHED_SUCCESS },
        data: {
          type: 'array',
          items: { $ref: getSchemaPath(ResumeAnalysis) },
        },
      },
    },
  })
  async getResumeAnalysis(
    @Req() req: Request,
    @Headers('x-client-type') _clientType: string,
  ) {
    return this.resumeAnalysisService.getResumeAnalyses(req['user'].id);
  }

//   private convertToExportLink(link: string): string {
//     if (link.includes('drive.google.com')) {
//       const match = link.match(GOOGLE_REGEX.DRIVE_FILE);
//       if (match) {
//         return GOOGLE_URLS.DRIVE_EXPORT(match[1]);
//       }
//     }
//     if (link.includes('docs.google.com/document')) {
//       const match = link.match(GOOGLE_REGEX.DOC_FILE);
//       if (match) {
//         return GOOGLE_URLS.DOC_EXPORT(match[1]);
//       }
//     }
//     return link;
//   }
}

@ApiTags('Client Profiling')
@Controller('api')
export class ClientProfilingController {
  constructor(private readonly clientProfilingService: ClientProfilingService) {}

  @Get('briefs')
  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, description: 'Successfully retrieved all briefs.', type: [ClientProfiling] })
  @ApiResponse({ status: 500, description: 'Failed to retrieve briefs.' })
  async getBriefs(
    @Req() req: Request, 
    @Headers('x-client-type') clientType: string, 
  ): Promise<ClientProfiling[]> {
    return this.clientProfilingService.getBriefs();
  }

  @Patch('briefs/:id/bookmark')
  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, description: 'Successfully updated bookmark status.', type: ClientProfiling })
  async bookmarkBrief(
    @Param('id') id: number,
    @Req() req: Request,
    @Headers('x-client-type') clientType: string,
  ): Promise<ClientProfiling> {
    return this.clientProfilingService.bookmarkBrief(id);
  }

  @Get('briefs/bookmarked')
  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, description: 'Successfully retrieved all bookmarked briefs.', type: [ClientProfiling] })
  async getBookmarkedBriefs(
    @Req() req: Request,
    @Headers('x-client-type') clientType: string,
  ): Promise<ClientProfiling[]> {
    return this.clientProfilingService.getBookmarkedBriefs();
  }

  @Post('generate-brief')
  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiResponse({ status: 201, description: 'The profile has been successfully generated.', type: ClientProfiling })
  @ApiResponse({ status: 500, description: 'Failed to generate profile.' })
  async createProfile(
    @Body() createMeetingDto: CreateMeetingDto,
    @Req() req: Request, 
    @Headers('x-client-type') clientType: string, 
  ): Promise<ClientProfiling> {
    return this.clientProfilingService.createProfile(createMeetingDto);
  }
}



//Stock agent controller ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

@ApiTags('Stock Agent')
@Controller('run')
export class RunController {
  constructor(private readonly runService: RunService) {}

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiBody({ type: CreateRunDto })
  @ApiResponse({
    status: 201,
    description: 'Run created successfully.',
  })
  async createRun(
    @Req() req: Request,
    @Headers('x-client-type') clientType: string,
    @Body() createRunDto: CreateRunDto,
  ) {
     return this.runService.create(createRunDto);
  }
}