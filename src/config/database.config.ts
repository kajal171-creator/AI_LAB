import { registerAs } from '@nestjs/config';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';

export default registerAs(
  'dbConfig',
  (): PostgresConnectionOptions => ({
    type: 'postgres',
    entities: ['dist/entities/*.entity{.ts,.js}'],
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USERNAME,
    password: String(process.env.DB_PASSWORD),
    database: process.env.DB_DATABASE,
    logging: process.env.NODE_ENV == 'dev' ? 'all' : undefined,
    synchronize: process.env.NODE_ENV == 'dev' ? true : false,
  }),
);
