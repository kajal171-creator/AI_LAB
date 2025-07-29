import { Module } from '@nestjs/common';
import { FeaturesController } from './features.controller';
import { ImageGeneratorService } from './services/image-generator.service';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImageGenerationHistory } from 'src/entities/image-generation.history.entity';
import { AiAgentApiService } from '../http-service/http-service.service';
import { UploaderService } from 'src/common/helpers/uplaod.helper';

@Module({
  imports: [HttpModule, TypeOrmModule.forFeature([ImageGenerationHistory])],
  controllers: [FeaturesController],
  providers: [ImageGeneratorService, AiAgentApiService, UploaderService],
})
export class FeaturesModule {}
