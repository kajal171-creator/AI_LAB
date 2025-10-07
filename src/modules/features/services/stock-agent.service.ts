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

  async getDailyActivitySummary(): Promise<{ date: string; buys: number; sells: number }[]> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const runs = await this.runRepository.find({
      where: {
        createdAt: MoreThan(thirtyDaysAgo),
      },
      order: {
        createdAt: 'ASC',
      },
    });

    const dailySummary: { [key: string]: { buys: number; sells: number } } = {};

    for (const run of runs) {

      const date = new Date(run.createdAt).toISOString().split('T')[0]; // Get YYYY-MM-DD
      if (!dailySummary[date]) {
        dailySummary[date] = { buys: 0, sells: 0 };
      }

      if (run.decisions && typeof run.decisions === 'object') {
        for (const ticker in run.decisions) {
          const decision = run.decisions[ticker];
          if (decision && typeof decision.label === 'string') {
            if (decision.label.toUpperCase() === 'BUY') {
              dailySummary[date].buys++;
            } else if (decision.label.toUpperCase() === 'SELL') {
              dailySummary[date].sells++;
            }
          }
        }
      }
    }

    // Convert the summary object to an array for the response
    return Object.keys(dailySummary).map(date => ({
      date,
      buys: dailySummary[date].buys,
      sells: dailySummary[date].sells,
    }));
  }
}

