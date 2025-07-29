import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ImageGenerationHistory } from 'src/entities/image-generation.history.entity';
import { AiAgentApiService } from 'src/modules/http-service/http-service.service';
import { UploaderService } from 'src/common/helpers/uplaod.helper';

@Injectable()
export class ImageGeneratorService {
  constructor(
    @InjectRepository(ImageGenerationHistory)
    private readonly imageGenRepo: Repository<ImageGenerationHistory>,
    private readonly aiAgentApiService: AiAgentApiService,
    private readonly uploaderService: UploaderService,
  ) {}

  async generateImage(prompt: string): Promise<{ imageUrl: string }> {
    try {
      const base64Image: string =
        await this.aiAgentApiService.getGeneratedImageFromAiAgent(prompt);

      const imageBuffer = Buffer.from(base64Image, 'base64');
      const s3Url = await this.uploaderService.upload(imageBuffer);

      const history = this.imageGenRepo.create({ prompt, imageUrl: s3Url });
      await this.imageGenRepo.save(history);

      return { imageUrl: s3Url };
    } catch (error) {
      throw new InternalServerErrorException('Image generation failed');
    }
  }
}
