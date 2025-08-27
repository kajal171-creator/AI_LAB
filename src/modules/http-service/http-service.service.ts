import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { AxiosResponse } from 'axios';
import { Injectable, InternalServerErrorException,Logger } from '@nestjs/common';
import { ResponseMessages } from 'src/common/constants/response-message.constants';
import { RESPONSE_STATUS } from 'src/common/constants/constants';
import axios from 'axios';
import {
  EMBEDDING_ENDPOINT,
  IMAGE_GENERATOR_ENDPOINT,
  RAG_CHAT_ENDPOINT,
  RESUME_ANALYZER_ENDPOINT,
} from 'src/common/constants/endpoints';
const PYTHON_BASE_URI = process.env.PYTHON_BASE_URI;

@Injectable()
export class AiAgentApiService {
   private readonly logger = new Logger(AiAgentApiService.name);
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

/*async analyzeResumes(jd: string, resumes: string[]): Promise<any> {
  const payload = { 
    job_desc: jd, 
    google_doc_links: resumes 
  };
  const PYTHON_BASE_URI = process.env.PYTHON_RESUME_ANALYZER_URI;

  try {
    const response = await lastValueFrom(
      this.httpService.post(`${PYTHON_BASE_URI}${RESUME_ANALYZER_ENDPOINT}`, payload, {
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    if (response.data.status !== RESPONSE_STATUS.SUCCESS) {
      throw new InternalServerErrorException(
        ResponseMessages.COMMON.SOMETHING_WENT_WRONG,
      );
    }

    return response.data.results; // array of {name, score, justification}
  } catch (error) {
    console.error('Python Resume API Error:', error.response?.data || error.message);
    throw new InternalServerErrorException('Resume analysis failed');
  }

}
}*/



 async analyzeResumes(job_desc: string, google_doc_links: string[]) {
    try {
      const url = `${process.env.PYTHON_RESUME_ANALYZER_URI}${RESUME_ANALYZER_ENDPOINT}`;
      const body = { job_desc, google_doc_links };

      this.logger.debug(`Sending resume analysis request to: ${url}`);
      this.logger.debug(`Request body: ${JSON.stringify(body)}`);

      const response = await lastValueFrom(
        this.httpService.post(url, body, {
          headers: { 'Content-Type': 'application/json' },
        }),
      );

      this.logger.debug(`Python API response: ${JSON.stringify(response.data)}`);
      return response.data;
    }

   catch (error) {
    if (error.response) {
      this.logger.error(
        `Resume analysis failed. Status: ${error.response.status}, Data: ${JSON.stringify(error.response.data)}`
      );
    } else {
      this.logger.error(`Resume analysis failed. Error: ${error.message}`, error.stack);
    }

    throw new InternalServerErrorException('Resume analysis failed');
  }
 }
}