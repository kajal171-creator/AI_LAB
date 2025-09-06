import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AiAgentApiService } from './http-service.service';

@Module({
  imports: [HttpModule],
  providers: [AiAgentApiService],
  exports: [AiAgentApiService],
})
export class HttpServiceModule {}



