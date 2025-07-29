import { Module } from '@nestjs/common';
import { FeaturesController } from './features.controller';
import { ImageGeneratorService } from './services/image-generator.service';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImageGenerationHistory } from 'src/entities/image-generation.history.entity';

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([ImageGenerationHistory]),
  ],
  controllers: [FeaturesController],
  providers: [ImageGeneratorService],
})
export class FeaturesModule {}
