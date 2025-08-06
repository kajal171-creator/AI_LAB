import { Module } from '@nestjs/common';
import { FeaturesController } from './features.controller';
import { ImageGeneratorService } from './services/image-generator.service';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImageGenerationHistory } from 'src/entities/image-generation.history.entity';
import { AiAgentApiService } from '../http-service/http-service.service';
import { UploaderService } from 'src/common/helpers/uplaod.helper';
import { RagChatbotService } from './services/rag-chatbot.service';
import { Message } from 'src/entities/message.entity';
import { Conversation } from 'src/entities/conversation.entity';
import { Knowledge } from 'src/entities/knowledge.entity';
import { User } from 'src/entities/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { ClientAuthGuard } from 'src/common/guards/client-auth.guard';
import { JwtHelper } from 'src/common/helpers/jwt.helper';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    HttpModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('jwt.accessTokenSecret'),
        signOptions: {
          expiresIn: config.get<string>('jwt.accessTokenExpiry'),
        },
      }),
    }),
    TypeOrmModule.forFeature([
      User,
      ImageGenerationHistory,
      Message,
      Conversation,
      Knowledge,
    ]),
  ],
  controllers: [FeaturesController],
  providers: [
    ImageGeneratorService,
    AiAgentApiService,
    UploaderService,
    RagChatbotService,
    ClientAuthGuard,
    JwtHelper,
  ],
})
export class FeaturesModule {}
