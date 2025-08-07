import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { AxiosResponse } from 'axios';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ResponseMessages } from 'src/common/constants/response-message.constants';
import { RESPONSE_STATUS } from 'src/common/constants/constants';
import axios from 'axios';
import * as FormData from 'form-data';
import { response } from 'express';
const PYTHON_PDF_CHAT_API = 'https://4ljdz2qw-8000.inc1.devtunnels.ms/chat/';

@Injectable()
export class AiAgentApiService {
  constructor(private readonly httpService: HttpService) {}

  async getGeneratedImageFromAiAgent(prompt: string): Promise<string> {
    const pythonBackendUrl = process.env.PYTHON_API_URL;

    try {
      const response: AxiosResponse = await lastValueFrom(
        this.httpService.post(pythonBackendUrl, { prompt }),
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

  async chatWithPdf(prompt: string, fileName: string): Promise<string> {
    const payload = {
      query: prompt,
      files: [fileName], // Match key in Python file_map.json
    };

    console.log('Payload for chatWithPdf:', payload);
    try {
      const response = await lastValueFrom(
        this.httpService.post(
          'https://4ljdz2qw-8000.inc1.devtunnels.ms/chat/',
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
}
