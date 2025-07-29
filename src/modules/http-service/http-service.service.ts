import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { AxiosResponse } from 'axios';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ResponseMessages } from 'src/common/constants/response-message.constants';
import { RESPONSE_STATUS } from 'src/common/constants/constants';

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
}
