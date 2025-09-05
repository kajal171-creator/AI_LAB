// src/modules/features/services/resume-checker.service.ts
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ResumeAnalysis } from '../../../entities/resume-analysis.entity';
import { AiAgentApiService } from '../../http-service/http-service.service';
import { UploaderService } from '../../../common/helpers/uplaod.helper';
import { ResponseMessages } from 'src/common/constants/response-message.constants';
import axios from 'axios';
import * as fs from 'fs/promises';
import * as path from 'path';
import { URL, fileURLToPath } from 'url';
import * as mime from 'mime-types';

export interface AnalyzeResumesDto {
  description: string;
  resumeLink?: string[];
  files?: Express.Multer.File[];
}

// These constants should be moved to a shared constants file for better organization.
const GOOGLE_REGEX = {
  DRIVE_FILE: /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/,
  DOC_FILE: /docs\.google\.com\/document\/d\/([a-zA-Z0-9_-]+)/,
};

const GOOGLE_URLS = {
  DRIVE_EXPORT: (id: string) => `https://docs.google.com/uc?export=download&id=${id}`,
  DOC_EXPORT: (id: string) => `https://docs.google.com/document/d/${id}/export?format=pdf`,
};

@Injectable()
export class ResumeAnalysisService {
  private readonly logger = new Logger(ResumeAnalysisService.name);

  constructor(
    @InjectRepository(ResumeAnalysis)
    private readonly resumeRepo: Repository<ResumeAnalysis>,
    private readonly aiAgentApiService: AiAgentApiService,
    private readonly uploaderService: UploaderService,
  ) {}

  private normalizeScore(rawScore: string | number): number {
    if (!rawScore) return 0;
    const num = parseFloat(String(rawScore).replace(/[^0-9.]/g, ''));
    return isNaN(num) ? 0 : num;
  }

  private convertToExportLink(link: string): string {
    let match = link.match(GOOGLE_REGEX.DRIVE_FILE);
    if (match?.[1]) {
      this.logger.log(`Converting Google Drive link: ${link}`);
      return GOOGLE_URLS.DRIVE_EXPORT(match[1]);
    }

    match = link.match(GOOGLE_REGEX.DOC_FILE);
    if (match?.[1]) {
      this.logger.log(`Converting Google Docs link: ${link}`);
      return GOOGLE_URLS.DOC_EXPORT(match[1]);
    }
    return link;
  }

  async analyzeResumes(dto: AnalyzeResumesDto, userId: string) {
    const { description, resumeLink, files } = dto;
    const allResumeUrls: string[] = [];

    // 1. Process uploaded files
    if (files && files.length > 0) {
      const fileUploadPromises = files.map(file =>
        this.uploaderService.upload(file.buffer, {
          fileName: file.originalname,
          mimetype: file.mimetype,
          folder: 'resumes',
        }),
      );
      const uploadedFileUrls = await Promise.all(fileUploadPromises);
      allResumeUrls.push(...uploadedFileUrls);
    }

    // 2. Process links (web URLs and local file URIs)
    if (resumeLink && resumeLink.length > 0) {
      const linkProcessingPromises = resumeLink.map(async originalLink => {
        try {
          let fileBuffer: Buffer;
          let fileName: string;
          let mimetype: string;

          if (originalLink.startsWith('file:///')) {
            // Handle local file URI
            this.logger.log(`Reading local file from: ${originalLink}`);
            const filePath = fileURLToPath(originalLink);
            fileBuffer = await fs.readFile(filePath);
            fileName = path.basename(filePath);
            mimetype = mime.lookup(fileName) || 'application/octet-stream';
          } else {
            // Handle web URL
            const link = this.convertToExportLink(originalLink);
            this.logger.log(`Downloading resume from: ${link}`);
            const response = await axios.get(link, {
              responseType: 'arraybuffer',
            });
            fileBuffer = Buffer.from(response.data);

            const contentDisposition = response.headers['content-disposition'];
            if (contentDisposition) {
              const fileNameMatch =
                contentDisposition.match(/filename="?([^"]+)"?/);
              if (fileNameMatch?.[1]) {
                fileName = fileNameMatch[1];
              }
            }

            if (!fileName) {
              try {
                const url = new URL(link);
                const pathName = url.pathname;
                if (pathName && pathName !== '/') {
                  fileName = path.basename(pathName);
                }
              } catch (e) {
                /* Ignore URL parsing errors */
              }
            }

            if (!fileName) {
              fileName = `resume-${Date.now()}`;
            }

            mimetype =
              response.headers['content-type'] || 'application/octet-stream';

            let correctExtension = '';
            if (mimetype.includes('pdf')) {
              correctExtension = '.pdf';
            } else if (
              mimetype.includes(
                'vnd.openxmlformats-officedocument.wordprocessingml.document',
              )
            ) {
              correctExtension = '.docx';
            } else if (mimetype.includes('msword')) {
              correctExtension = '.doc';
            } else if (mimetype.includes('plain')) {
              correctExtension = '.txt';
            }

            fileName =
              path.parse(fileName).name +
              (correctExtension || path.extname(fileName) || '.pdf');
          }

          return this.uploaderService.upload(fileBuffer, {
            fileName,
            mimetype,
            folder: 'resumes',
          });
        } catch (error) {
          this.logger.error(
            `Failed to process resume from link: ${originalLink}`,
            error.stack,
          );
          return null;
        }
      });

      const processedLinkUrls = (
        await Promise.all(linkProcessingPromises)
      ).filter((url): url is string => url !== null);
      allResumeUrls.push(...processedLinkUrls);
    }

    if (allResumeUrls.length === 0) {
      return { message: 'No valid resumes could be processed.', data: null };
    }

    const analysisResponse = await this.aiAgentApiService.analyzeResumes(
      description,
      allResumeUrls,
    );


const results = Array.isArray(analysisResponse.results)
  ? analysisResponse.results
  : [analysisResponse];

if (!results || results.length === 0) {
  throw new Error(ResponseMessages.RESUME.ANALYZE_FAILED);
}


    const analysesToSave = analysisResponse.results.map(result => {
      const fullResumeLink =
        allResumeUrls.find(url => url.includes(result.filename)) ||
        result.filename;
      return this.resumeRepo.create({
        description,
        user: { id: userId },
        fileName: result.filename,
        candidateName: result.candidate_name,
        score: this.normalizeScore(result.overall_score),
        resumeLink: fullResumeLink,
        justification: result.summary,
        rank: result.rank,
        recommendation: result.recommendation,
        semantic_similarity: this.normalizeScore(result.semantic_similarity),
        confidence: result.confidence,
        strengths: result.strengths,
        gaps: result.gaps,
        keyword_analysis: result.keyword_analysis,
        detailed_scores: result.detailed_scores,
        stability: result.stability,
        suggested_profile: result.suggested_profile,
      });
    });

    const savedAnalyses = await this.resumeRepo.save(analysesToSave);

    analysisResponse.results.forEach(result => {
      const saved = savedAnalyses.find(s => s.fileName === result.filename);
      if (saved) {
        (result as any).databaseId = saved.id;
      }
    });

    return analysisResponse;
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
