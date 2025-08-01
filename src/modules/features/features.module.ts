import { Module } from '@nestjs/common';
import { FeaturesController } from './features.controller';
import { ImageGeneratorService } from './services/image-generator.service';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImageGenerationHistory } from 'src/entities/image-generation.history.entity';
import { AiAgentApiService } from '../http-service/http-service.service';
import { UploaderService } from 'src/common/helpers/uplaod.helper';
import { RagChatService } from './services/rag-chatbot.service';
import { RagChat} from 'src/entities/rag-chat.entity';
import { Conversation } from 'src/entities/rag-conversation.entity';
import { Knowledge } from 'src/entities/rag-knowledge.entity';

@Module({
  imports: [HttpModule, TypeOrmModule.forFeature([ImageGenerationHistory,RagChat,Conversation,Knowledge])],
  controllers: [FeaturesController],
  providers: [ImageGeneratorService, AiAgentApiService, UploaderService, RagChatService],
})
export class FeaturesModule {}
