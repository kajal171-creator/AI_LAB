// src/modules/features/services/resume-checker.service.ts
import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ResumeAnalysis } from '../../../entities/resume-analysis.entity';
import { AiAgentApiService } from '../../http-service/http-service.service';
import { UploaderService } from '../../../common/helpers/uplaod.helper';
import { GOOGLE_REGEX, GOOGLE_URLS } from '../../../common/constants/constants';
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

  private async processFile(
    buffer: Buffer,
    originalName: string,
    mimetype: string,
  ): Promise<string> {
    return this.uploaderService.upload(buffer, {
      fileName: originalName,
      mimetype,
      folder: 'resumes',
    });
  }

  private getFileNameFromUrl(link: string, headers: any): string {
    const contentDisposition = headers['content-disposition'];
    if (contentDisposition) {
      const fileNameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
      if (fileNameMatch?.[1]) {
        return fileNameMatch[1];
      }
    }

    try {
      const url = new URL(link);
      const pathName = url.pathname;
      if (pathName && pathName !== '/') {
        return path.basename(pathName);
      }
    } catch (e) {
      this.logger.warn(`Could not parse URL to get filename: ${link}`);
    }

    return `resume-${Date.now()}`;
  }

  private getCorrectedFileName(fileName: string, mimetype: string): string {
    const extensionMap = {
      'application/pdf': '.pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        '.docx',
      'application/msword': '.doc',
      'text/plain': '.txt',
    };

    const correctExtension = extensionMap[mimetype] || path.extname(fileName);
    const baseName = path.parse(fileName).name;

    // Default to .pdf if no other extension is found
    return `${baseName}${correctExtension || '.pdf'}`;
  }

  private async processLink(originalLink: string): Promise<string | null> {
    try {
      if (originalLink.startsWith('file:///')) {
        // This works on localhost but is not recommended for Docker/production.
        // The file must exist on the server's filesystem where the app is running, which is unlikely in Docker.
        this.logger.log(`Reading local file from: ${originalLink}`);
        const filePath = fileURLToPath(originalLink);
        const fileBuffer = await fs.readFile(filePath);
        const fileName = path.basename(filePath);
        const mimetype = mime.lookup(fileName) || 'application/octet-stream';
        return this.processFile(fileBuffer, fileName, mimetype);
      } else {
        // Handle web URLs (Google Drive, Docs, public links)
        const downloadLink = this.convertToExportLink(originalLink);
        this.logger.log(`Downloading resume from: ${downloadLink}`);
        const response = await axios.get(downloadLink, {
          responseType: 'arraybuffer',
        });

        const fileBuffer = Buffer.from(response.data);
        const mimetype =
          response.headers['content-type'] || 'application/octet-stream';
        const rawFileName = this.getFileNameFromUrl(downloadLink, response.headers);
        const finalFileName = this.getCorrectedFileName(rawFileName, mimetype);

        return this.processFile(fileBuffer, finalFileName, mimetype);
      }
    } catch (error) {
      this.logger.error(
        `Failed to process resume from link: ${originalLink}`,
        error.stack,
      );
      if (axios.isAxiosError(error)) {
        this.logger.error(`Axios error: ${error.message} for URL: ${error.config.url}`);
      }
      return null;
    }
  }

  async analyzeResumes(dto: AnalyzeResumesDto, userId: string) {
    const { description, resumeLink, files } = dto;
    const allResumeUrls: string[] = [];
    const processingPromises: Promise<string | null>[] = [];

    if ((!files || files.length === 0) && (!resumeLink || resumeLink.length === 0)) {
      throw new BadRequestException('No resumes provided. Please provide files or links.');
    }

    // 1. Queue uploaded files for processing
    if (files?.length > 0) {
      files.forEach(file =>
        processingPromises.push(
          this.processFile(file.buffer, file.originalname, file.mimetype),
        ),
      );
    }

    // 2. Queue links for processing
    if (resumeLink?.length > 0) {
      resumeLink.forEach(link => processingPromises.push(this.processLink(link)));
    }

    // 3. Await all processing and filter out failures
    const processedUrls = (await Promise.all(processingPromises)).filter(
      (url): url is string => url !== null,
    );
    allResumeUrls.push(...processedUrls);

    if (allResumeUrls.length === 0) {
      throw new BadRequestException('No valid resumes could be processed from the provided files or links.');
    }

    // 4. Send to AI service for analysis
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

    // 5. Save analysis results to the database
    const analysesToSave = results.map(result => {
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

    // 6. Augment response with database IDs
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
