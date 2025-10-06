import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientProfilingController } from './features.controller';
import { ClientProfilingService } from './services/client-profiling.service';
import { ClientProfiling } from '../../entities/client-profiling.entity';
import { HttpServiceModule } from '../http-service/http-service.module';
import { ClientAuthGuard } from 'src/common/guards/client-auth.guard';
import { JwtHelper } from 'src/common/helpers/jwt.helper';

@Module({
  imports: [TypeOrmModule.forFeature([ClientProfiling]), HttpServiceModule],
  controllers: [ClientProfilingController],
  providers: [ClientProfilingService, ClientAuthGuard, JwtHelper],
})
export class ClientProfilingModule {}
