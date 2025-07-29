import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ImageGenerationHistory } from 'src/entities/image-generation.history.entity';
// import your S3 upload helper here

@Injectable()
export class ImageGeneratorService {
  constructor(
    private readonly httpService: HttpService,
    @InjectRepository(ImageGenerationHistory)
    private readonly imageGenRepo: Repository<ImageGenerationHistory>,
    // inject your S3 service/helper if needed
  ) {}

  async generateImage(prompt: string): Promise<{ imageUrl: string }> {
    try {
      // 1. Call Python backend
      const pythonBackendUrl = process.env.PYTHON_API_URL;
      console.log('Calling Python backend with prompt:', prompt);
      const response = await this.httpService.post(pythonBackendUrl, { prompt }).toPromise();
      console.log('Python backend response:', response.data);

      if (response.data.status !== 'success') {
        throw new InternalServerErrorException('Python backend error');
      }

      // 2. Get base64 image
      const base64Image = response.data.image_base64;

      // 3. Upload to S3 (implement your own upload logic)
      const imageBuffer = Buffer.from(base64Image, 'base64');
      const s3Url = await this.uploadToS3(imageBuffer); 

      // 4. Save to DB
      const history = this.imageGenRepo.create({ prompt, imageUrl: s3Url });
      await this.imageGenRepo.save(history);

      // 5. Return S3 URL 
      return { imageUrl: s3Url };
    } catch (error) {
      console.log('Image generation error', error);
      throw new InternalServerErrorException('Image generation failed');
    }
  }


  async uploadToS3(imageBuffer: Buffer): Promise<string> {
    // S3 upload logic here
    return "";
  }
}
