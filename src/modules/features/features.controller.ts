import { Body, Controller, Post } from '@nestjs/common';
import { ImageGeneratorService } from './services/image-generator.service';
import { GenerateImageDto } from './dto/generate-image.dto';

@Controller('features')
export class FeaturesController {
  constructor(private readonly imageGeneratorService: ImageGeneratorService) {}

  @Post('generate-image')
  async generateImage(@Body() generateImageDto: GenerateImageDto) {
    return this.imageGeneratorService.generateImage(generateImageDto.text);
  }
}
