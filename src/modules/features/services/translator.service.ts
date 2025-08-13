import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ResponseMessages } from 'src/common/constants/response-message.constants';
import { Translation } from 'src/entities/translation.entity';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateTranslationDto } from '../dto/create-translation.dto';
import { AiAgentApiService } from 'src/modules/http-service/http-service.service';

@Injectable()
export class TranslatorService {
  constructor(
    @InjectRepository(Translation)
    private readonly translationRepository: Repository<Translation>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly aiAgentApiService: AiAgentApiService,
  ) {}

  // Create new translation
  async createTranslation(
    body: CreateTranslationDto,
    userId: string,
  ): Promise<string> {
    try {
      const user = await this.userRepository.findOne({ where: { id: userId } });

      if (!user) {
        throw new BadRequestException(ResponseMessages.USER.NOT_FOUND);
      }

      const translatedText = await this.aiAgentApiService.translateText(
        body.text,
        body.sourceLanguage,
        body.targetLanguage,
        body.style,
        userId,
      );

      if (!translatedText) {
        throw new InternalServerErrorException(ResponseMessages.Translation.TRANSLATION_ERROR);
      }
      console.log('Translated Text:---------- ', translatedText);
    
      const translation = this.translationRepository.create({
        sourceLanguage: body.sourceLanguage,
        targetLanguage: body.targetLanguage,
        text: body.text,
        translatedText,
        style: body.style,
        user,
      });

      await this.translationRepository.save(translation);

      return translatedText;
    } catch (error) {
      console.error('Error creating translation:', error);
      throw error;
    }
  }

  async getTranslations(userId: string): Promise<Translation[]> {
    try {
      return await this.translationRepository.find({
        where: { user: { id: userId } },
        relations: ['sender', 'receiver'],
        order: { createdAt: 'DESC' },
      });
    } catch (error) {
      console.error('Error fetching translations:', error);
      throw error;
    }
  }
}
