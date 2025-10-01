// src/run/run.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { Run } from '../../../entities/stock-agent.entity';
import { CreateRunDto } from '../dto/stock-agent.dto';
import { AiAgentApiService } from '../../http-service/http-service.service';

@Injectable()
export class RunService {
  constructor(
    @InjectRepository(Run)
    private readonly runRepository: Repository<Run>, 
    private readonly aiAgentApiService: AiAgentApiService,
  ) {}

  async create(createRunDto: CreateRunDto): Promise<Run[]> {
    const pythonResponse = await this.aiAgentApiService.runStockAnalysis(createRunDto);
    const run = this.runRepository.create({
      ...createRunDto, 
      ...pythonResponse, 
    });

    return this.runRepository.save(run);
    }

  

  async getTickerActivitySummary(): Promise<{ ticker: string; buys: number; sells: number }[]> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const runs = await this.runRepository.find({
      where: {
        createdAt: MoreThan(thirtyDaysAgo),
      },
    });

    const tickerSummary: { [key: string]: { buys: number; sells: number } } = {};

    for (const run of runs) {
      if (run.decisions && typeof run.decisions === 'object') {
        for (const ticker in run.decisions) {
          if (!tickerSummary[ticker]) {
            tickerSummary[ticker] = { buys: 0, sells: 0 };
          }
          const decision = run.decisions[ticker];
          if (decision?.label?.toUpperCase() === 'BUY') {
            tickerSummary[ticker].buys++;
          } else if (decision?.label?.toUpperCase() === 'SELL') {
            tickerSummary[ticker].sells++;
          }
        }
      }
    }

    // Convert the summary object to an array for the response
    return Object.keys(tickerSummary).map(ticker => ({
      ticker,
      buys: tickerSummary[ticker].buys,
      sells: tickerSummary[ticker].sells,
    }));
  }
}
