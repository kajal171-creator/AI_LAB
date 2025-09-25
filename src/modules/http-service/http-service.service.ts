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
  TRANSLATION_ENDPOINT,
  CLIENT_PROFILE_ENDPOINT,
  RAG_EVALUATION_ENDPOINT,
  STOCK_AGENT_ENDPOINT
} from 'src/common/constants/endpoints';
import { console } from 'inspector';
import { AiModelType } from 'src/common/enums/role.enum';
import { CreateMeetingDto } from '../features/dto/client-profiling.dto';
import { CreateRunDto } from '../features/dto/stock-agent.dto';
import { error } from 'console';
//const PYTHON_BASE_URI = process.env.PYTHON_BASE_URI;

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

  async evaluateRag(
    query: string,
    answer: string,
    retrieved_contexts: string[],
    reference: string,
  ): Promise<any> {
    const payload = {
      query,
      answer,
      retrieved_contexts,
      reference,
    };
    const PYTHON_BASE_URI = process.env.PYTHON_BASE_URI;

    try {
      const response = await lastValueFrom(
        this.httpService.post(
          `${PYTHON_BASE_URI}${RAG_EVALUATION_ENDPOINT}`,
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
        'Error in evaluateRag:',
        error.response?.data || error.message,
      );
      throw new InternalServerErrorException('RAG evaluation failed');
    }
  }

  async callEmbeddingAPI(payload: {
    userId: string;
    files: { fileName: string; url: string }[];
  }): Promise<{ successFiles: { fileName: string }[]; failedFiles?: string[] }> {
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
             timeout: 1000 * 60 * 10,
             validateStatus: () => true,
          },
        ),
      );
      //return response.data;

      console.log('Embedding API raw response:', response.data);

    if (response.status >= 200 && response.status < 300) {
      return {
        successFiles: response.data?.successFiles || [],
        failedFiles: response.data?.failedFiles || [],
      };
    } else {
      return {
        successFiles: [],
        failedFiles: response.data?.failedFiles || [response.data?.message || 'Unknown error'],
      };
    }
    } catch (error) {
      // console.error(
      //   'Embedding API Error:',
      //   error.response?.data || error.message,
      // );
      // return { successFiles: [] };
    const errData = error.response?.data || error.message;
    console.error('Embedding API Error:', errData);

    return { successFiles: [], failedFiles: ['Network error or no response'] };
    }
  }

  async translateText(
    text: string,
    source_language: string,
    target_language: string,
    style_guide_input: string,
    aiModelType: AiModelType,
  ): Promise<string> {
    const payload = {
      text,
      source_language: source_language,
      target_language,
      style_guide_input,
      aiModelType
    };
    console.log('Translation payload:', payload);
    const PYTHON_BASE_URI = process.env.PYTHON_BASE_URI_TRANSLATION;
    try {
      console.log('Translation payload:', payload);
      const response = await lastValueFrom(
        this.httpService.post(
          `${PYTHON_BASE_URI}${TRANSLATION_ENDPOINT}`,
          payload,
          {
            headers: {
              'Content-Type': 'application/json',
            },
          },
        ),
      );
      console.log('Response from translation API:', response.data.translation);

      if (!response.data || !response.data.translation) {
      throw new InternalServerErrorException(
        ResponseMessages.COMMON.SOMETHING_WENT_WRONG,
      );
    }
      return response.data.translation;
    } catch (error) {
      console.error(
        'Error in translateText:',
        error.response?.data || error.message,
      );

      throw new InternalServerErrorException('Translation failed');
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



 async analyzeResumes(description: string, resumeLink: string[]) {
    try {
       this.logger.debug('PDF file(s) uploaded.', { resumeLinks: resumeLink });

      const url = `${process.env.PYTHON_RESUME_ANALYZER_URI}${RESUME_ANALYZER_ENDPOINT}`;
      const body = { description, resumeLink };

      this.logger.debug(`Sending resume analysis request to Python API at ${url}`);
      this.logger.debug(`Request body -> ${JSON.stringify(body)}`);

      this.logger.debug(`Sending resume analysis request to: ${url}`);
      this.logger.debug(`Request body: ${JSON.stringify(body)}`);

      const response = await lastValueFrom(
        this.httpService.post(url, body, {
          headers: { 'Content-Type': 'application/json' },
        }),
      );
      this.logger.debug('Resume Analyzer: Response received from Python API.');
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


async generateClientProfile(createDto: CreateMeetingDto) {
    try {
      const url = `${process.env.CLIENT_PROFILE_PYTHON_URI}${CLIENT_PROFILE_ENDPOINT}`;

      this.logger.debug(`Sending client profile request to Python API at ${url}`);
      this.logger.debug(`Request body -> ${JSON.stringify(createDto)}`);

      const response = await lastValueFrom(
        this.httpService.post(url, createDto, {
          headers: { 'Content-Type': 'application/json' },
        }),
      );

      this.logger.debug('Client Profiling: Response received from Python API.');
      this.logger.debug(`Python API response: ${JSON.stringify(response.data)}`);

      return response.data; // returns whatever the Python API sends
    } catch (error) {
      if (error.response) {
        this.logger.error(
          `Client profiling failed. Status: ${error.response.status}, Data: ${JSON.stringify(error.response.data)}`
        );
      } else {
        this.logger.error(`Client profiling failed. Error: ${error.message}`, error.stack);
      }

      throw new InternalServerErrorException('Client profiling failed');
    }
  }



async runStockAnalysis(stockDto: CreateRunDto) {
    try {
      const url = `${process.env.STOCK_AGENT_PYTHON_URI}${STOCK_AGENT_ENDPOINT}`;

      this.logger.debug(`Sending stock analysis request to Python API at ${url}`);
      this.logger.debug(`Request body -> ${JSON.stringify(stockDto)}`);

      const response = await lastValueFrom(
        this.httpService.post(url, stockDto, {
          headers: { 'Content-Type': 'application/json' },
          timeout: 600000,
        }),
      );

      this.logger.debug('StockAgent: Response received from Python API.');
      this.logger.debug(`Python API response: ${JSON.stringify(response.data)}`);

      return response.data;
    } catch (error) {
      if (error.response) {
        this.logger.error(
          `Stock analysis failed. Status: ${error.response.status}, Data: ${JSON.stringify(error.response.data)}`,
        );
      }
       else {
        this.logger.error(`Stock analysis failed. Error: ${error.message}`, error.stack);
      }
      throw new InternalServerErrorException('Stock analysis failed');
    }
}
}
