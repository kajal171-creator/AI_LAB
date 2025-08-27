// src/modules/features/services/resume-checker.service.ts
import { Injectable, Logger, NotFoundException, Res } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ResumeAnalysis } from '../../../entities/resume-analysis.entity';
import { AiAgentApiService } from '../../http-service/http-service.service';
import { UploaderService } from '../../../common/helpers/uplaod.helper';
import { ResponseMessages } from 'src/common/constants/response-message.constants';
import axios from 'axios';

export interface AnalyzeResumesDto {
  description: string;
  resumeLink?: string[];
  files?: Express.Multer.File[];
}


@Injectable()
export class ResumeAnalysisService {
  private readonly logger = new Logger(ResumeAnalysisService.name);

  constructor(
    @InjectRepository(ResumeAnalysis)
    private readonly resumeRepo: Repository<ResumeAnalysis>,
    private readonly aiAgentApiService: AiAgentApiService,
    private readonly uploaderService: UploaderService,
  ) {}


  private normalizeScore(rawScore: any): number {
    if (!rawScore) return 0;
    const num = parseFloat(String(rawScore).replace(/[^0-9.]/g, '')); 
    return isNaN(num) ? 0 : num;
  }

  async analyzeResumes(dto: AnalyzeResumesDto, userId: string) {
    const { description, resumeLink, files } = dto;

    const processResumeBuffer = async (
      buffer: Buffer,
      source: string,
      options: { fileName: string; mimetype: string },
    ) => {
      try {
        this.logger.log(`Uploading and analyzing resume from ${source}`);
        const resumeUrl = await this.uploaderService.upload(buffer, {
          fileName: options.fileName,
          mimetype: options.mimetype,
          folder: 'resumes',
        });

        const analysisResponse = await this.aiAgentApiService.analyzeResumes(
          description,
          [resumeUrl],
        );

        if (!analysisResponse || analysisResponse.length === 0) {
          throw new Error(ResponseMessages.RESUME.ANALYZE_FAILED);
        };

        const { name, score, justification } = analysisResponse[0];

        const safeName = name && name.trim() !== ''
          ? name
          : 'Unknown';

        const cleanScore = this.normalizeScore(score);

        const analysis = this.resumeRepo.create({
          description,
          candidateName: safeName,   
          resumeLink: resumeUrl,
          score: cleanScore,
          justification: justification,
          user: { id: userId },
        });
        await this.resumeRepo.save(analysis);

        return { name: safeName, score: cleanScore, justification };
      } catch (error) {
        this.logger.error(
          `Failed to analyze resume from ${source}. Error: ${error.message}`,
          error.stack,
        );
        let errorMessage = 'An unexpected error occurred during analysis.';
        if (error.code === 'ECONNREFUSED') {
          errorMessage = `Connection refused. Please ensure the Python service is running.`;
        } else {
          errorMessage = error.message;
        }
        
        return {
          name: `Unknown (failed: ${source})`,
          score: 0,
          justification: `Server Error: ${errorMessage}`,
        };
      }
    };

    const analysisPromises = [];

    if (files && files.length > 0) {
      for (const file of files) {
        analysisPromises.push(
          processResumeBuffer(
            file.buffer,
            `uploaded file: ${file.originalname}`,
            { fileName: file.originalname, mimetype: file.mimetype },
          ),
        );
      }
    }

    if (resumeLink && resumeLink.length > 0) {
      for (const link of resumeLink) {
        const linkPromise = (async () => {
          try {
            this.logger.log(`Downloading resume from link: ${link}`);
            const response = await axios.get(link, {
              responseType: 'arraybuffer',
            });
            const fileBuffer = Buffer.from(response.data);

            const contentDisposition = response.headers['content-disposition'];
            let fileName = `resume-${Date.now()}.pdf`; 
            if (contentDisposition) {
              const fileNameMatch = contentDisposition.match(/filename="(.+)"/);
              if (fileNameMatch && fileNameMatch.length > 1) {
                fileName = fileNameMatch[1];
              }
            }

            const mimetype =
              response.headers['content-type'] || 'application/pdf';

            return await processResumeBuffer(fileBuffer, `link: ${link}`, {
              fileName,
              mimetype,
            });
          } catch (error) {
            this.logger.error(
              `Failed to download resume from link: ${link}`,
              error.stack,
            );
            const errorMessage = axios.isAxiosError(error)
              ? `Failed to download from link: ${error.message}`
              : 'Could not download file from link.';
            return {
              name: `Unknown (failed: ${link})`,
              score: 0,
              justification: `Server Error: ${errorMessage}`,
            };
          }
        })();
        analysisPromises.push(linkPromise);
      }
    }

    return Promise.all(analysisPromises);
  }

  async getResumeAnalyses(userId: string) {
    const analyses = await this.resumeRepo.find({
      where: { user: { id: userId } },
    });
    if (!analyses || analyses.length === 0) {
      throw new NotFoundException(ResponseMessages.COMMON.RESUME_NOT_FOUND);
    }
    return {
      message: ResponseMessages.RESUME.FETCHED_SUCCESS,
      statusCode: 200,
      data: analyses,
    };
  }
}
