// src/run/run.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
}

