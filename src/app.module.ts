import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import dbConfig from './config/database.config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './modules/users/users.module';

import { APP_INTERCEPTOR } from '@nestjs/core';
import { SuccessResponseInterceptor } from './common/interceptors/response.interceptor';
import jwtConfig from './config/jwt.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      expandVariables: true,
      envFilePath: ['.env.local', '.env.dev', '.env.staging', '.env.prod'],
      load: [dbConfig, jwtConfig],
    }),
    TypeOrmModule.forRootAsync({
      useFactory: dbConfig,
    }),
    UsersModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: SuccessResponseInterceptor,
    },
    AppService,
  ],
})
export class AppModule {}
