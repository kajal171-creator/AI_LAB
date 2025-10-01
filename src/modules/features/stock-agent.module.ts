import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RunController } from './features.controller';
import { RunService } from './services/stock-agent.service';
import { Run } from '../../entities/stock-agent.entity';
import { HttpServiceModule } from '../http-service/http-service.module';
import { ClientAuthGuard } from 'src/common/guards/client-auth.guard';
import { JwtHelper } from 'src/common/helpers/jwt.helper';

@Module({
  imports: [TypeOrmModule.forFeature([Run]), HttpServiceModule],
  controllers: [RunController],
  providers: [RunService, ClientAuthGuard, JwtHelper],
})
export class StockAgentModule {}
