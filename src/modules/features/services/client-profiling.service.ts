import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientProfiling } from '../../../entities/client-profiling.entity';
import { CreateMeetingDto } from '../dto/client-profiling.dto';
import { AiAgentApiService } from '../../http-service/http-service.service';

@Injectable()
export class ClientProfilingService {
  private readonly logger = new Logger(ClientProfilingService.name);

  constructor(
    @InjectRepository(ClientProfiling)
    private readonly profileRepository: Repository<ClientProfiling>,
    private readonly aiAgentApiService: AiAgentApiService,
  ) {}

  async createProfile(createDto: CreateMeetingDto): Promise<ClientProfiling> {
    this.logger.log(`Starting profile generation for: ${createDto.attendee_name}`);

    const brief = await this.aiAgentApiService.generateClientProfile(createDto);

    if (Array.isArray(brief)) {
      throw new Error('Python API returned an array, expected an object');
    }

    this.logger.log(`Brief successfully generated for: ${createDto.attendee_name}`);

    const newProfile = this.profileRepository.create({
      ...createDto,
    ...(brief as Record<string, any>),
      meeting_date: createDto.meeting_date ? new Date(createDto.meeting_date) : null,
      generated_at: brief.generated_at ? new Date(brief.generated_at) : new Date(),
    });

    return this.profileRepository.save(newProfile);
  }

  async getBriefs(): Promise<ClientProfiling[]> {
    this.logger.log('Fetching all client profiles from the database.');
    return this.profileRepository.find();
  }
}
