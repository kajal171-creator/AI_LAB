import { Module } from '@nestjs/common';
import { ClientProfilingController, FeaturesController,ResumeAnalysisController } from './features.controller';
import { ImageGeneratorService } from './services/image-generator.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImageGenerationHistory } from 'src/entities/image-generation.history.entity';
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
import { ResumeAnalysisService } from './services/resume-checker.service';
import { ResumeAnalysis } from 'src/entities/resume-analysis.entity';
import { HttpServiceModule } from '../http-service/http-service.module';
import { TranslatorService } from './services/translator.service';
import { Translation } from 'src/entities/translation.entity';
import { ClientProfilingService } from './services/client-profiling.service';
import { ClientProfiling } from 'src/entities/client-profiling.entity';
import { RagEvaluation } from 'src/entities/rag-evaluation.entity';

@Module({
  imports: [
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
      ResumeAnalysis,
      Translation,
      ClientProfiling,
      RagEvaluation,
    ]),
    HttpServiceModule,
  ],
  controllers: [FeaturesController, ResumeAnalysisController,ClientProfilingController],
  providers: [
    ImageGeneratorService,
    UploaderService,
    RagChatbotService,
    ClientAuthGuard,
    JwtHelper,
    ResumeAnalysisService,
    ClientProfilingService,
    TranslatorService
  ],
})
export class FeaturesModule {}
