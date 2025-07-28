import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../entities/user.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtHelper } from 'src/common/helpers/jwt.helper';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('jwt.accessTokenSecret'),
        signOptions: {
          expiresIn: config.get<string>('jwt.accessTokenExpiry'),
        },
      }),
    }),
  ],
  providers: [UsersService, JwtHelper],
  controllers: [UsersController],
})
export class UsersModule {}
