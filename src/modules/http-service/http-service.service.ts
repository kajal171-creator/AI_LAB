import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { AxiosResponse } from 'axios';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ResponseMessages } from 'src/common/constants/response-message.constants';
import { RESPONSE_STATUS } from 'src/common/constants/constants';
import axios from 'axios';
import {
  EMBEDDING_ENDPOINT,
  IMAGE_GENERATOR_ENDPOINT,
  RAG_CHAT_ENDPOINT,
} from 'src/common/constants/endpoints';
//const PYTHON_BASE_URI = process.env.PYTHON_BASE_URI;

@Injectable()
export class AiAgentApiService {
  constructor(private readonly httpService: HttpService) {}

  async getGeneratedImageFromAiAgent(prompt: string): Promise<string> {
    try {
      const PYTHON_BASE_URI = process.env.PYTHON_BASE_URI;

      const response: AxiosResponse = await lastValueFrom(
        this.httpService.post(`${PYTHON_BASE_URI}${IMAGE_GENERATOR_ENDPOINT}`, {
          prompt,
        }),
      );

      if (response.data.status !== RESPONSE_STATUS.SUCCESS) {
        throw new InternalServerErrorException(
          ResponseMessages.COMMON.SOMETHING_WENT_WRONG,
        );
      }

      const base64Image = response.data.image_base64;

      return base64Image;
    } catch (error) {
      console.error(
        'Error calling Python backend:',
        error?.response?.data || error.message,
      );
      throw error;
    }
  }

  async chatWithPdf(
    prompt: string,
    fileNames: string[],
    userId: string,
  ): Promise<string> {
    const payload = {
      query: prompt,
      filenames: fileNames,
      user_id: userId,
    };
    const PYTHON_BASE_URI = process.env.PYTHON_BASE_URI;

    try {
      const response = await lastValueFrom(
        this.httpService.post(
          `${PYTHON_BASE_URI}${RAG_CHAT_ENDPOINT}`,
          payload,
          {
            headers: {
              'Content-Type': 'application/json',
            },
          },
        ),
      );

      return response.data.answer;
    } catch (error) {
      console.error(
        'Error in chatWithPdf:',
        error.response?.data || error.message,
      );
      throw new InternalServerErrorException('AI chat with PDF failed');
    }
  }

  async callEmbeddingAPI(payload: {
    userId: string;
    files: { fileName: string; url: string }[];
  }): Promise<{ successFiles: { fileName: string }[] }> {
    try {
      const PYTHON_BASE_URI = process.env.PYTHON_BASE_URI;
      const response = await lastValueFrom(
        this.httpService.post(
          `${PYTHON_BASE_URI}${EMBEDDING_ENDPOINT}`,
          payload,
          {
            headers: {
              'Content-Type': 'application/json',
            },
          },
        ),
      );
      return response.data;
    } catch (error) {
      console.error(
        'Embedding API Error:',
        error.response?.data || error.message,
      );
    }
  }

  async translateText(
    originalText: string,
    sourceLanguage: string,
    targetLanguage: string,
    style: string,
    userId: string,
  ): Promise<string> {
    const payload = {
      originalText,
      sourceLanguage,
      targetLanguage,
      style,
      userId,
    };
    const PYTHON_BASE_URI = process.env.PYTHON_BASE_URI;
    try {
      const response = await lastValueFrom(
        this.httpService.post(
          `${PYTHON_BASE_URI}${RAG_CHAT_ENDPOINT}`,
          {
            payload,
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          },
        ),
      );
      if (response.data.status !== RESPONSE_STATUS.SUCCESS) {
        throw new InternalServerErrorException(
          ResponseMessages.COMMON.SOMETHING_WENT_WRONG,
        );
      }
      return response.data.answer;
    } catch (error) {
      console.error(
        'Error in translateText:',
        error.response?.data || error.message,
      );
      throw new InternalServerErrorException('Translation failed');
    }
  }
}
