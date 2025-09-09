// import { registerAs } from '@nestjs/config';
// import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';

// export default registerAs(
//   'dbConfig',
//   (): PostgresConnectionOptions => ({
//     type: 'postgres',
//     entities: ['dist/entities/*.entity{.ts,.js}'],
//     host: process.env.DB_HOST,
//     port: Number(process.env.DB_PORT),
//     username: process.env.DB_USERNAME,
//     password: String(process.env.DB_PASSWORD),
//     database: process.env.DB_DATABASE,
//     logging: process.env.NODE_ENV == 'dev' ? 'all' : undefined,
//     synchronize: process.env.NODE_ENV == 'dev' ? true : false,
//   }),
// );

import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export default registerAs(
  'dbConfig',
  (): TypeOrmModuleOptions => {
    const isDev = process.env.NODE_ENV === 'development';

    return {
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 5432,
      username: process.env.DB_USERNAME || 'antino',
      password: process.env.DB_PASSWORD || 'antino',
      database: process.env.DB_DATABASE || 'antino_ai',
      entities: ['dist/src/entities/*.entity{.ts,.js}'],
      logging: isDev ? 'all' : undefined,
      synchronize: isDev,
      retryAttempts: 10,
      retryDelay: 3000,
    };
  },
);
