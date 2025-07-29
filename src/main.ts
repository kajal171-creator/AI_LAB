import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import {
  BadRequestException,
  HttpStatus,
  ValidationPipe,
  HttpException,
} from '@nestjs/common';
import { ValidationError } from 'class-validator';
import * as cookieParser from 'cookie-parser';
import { NotFoundExceptionFilter } from './common/filters/not-found.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  app.setGlobalPrefix('antino-ai');
  app.useGlobalFilters(new NotFoundExceptionFilter());

  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      forbidUnknownValues: true,
      transform: true,
      stopAtFirstError: false,
      errorHttpStatusCode: HttpStatus.BAD_REQUEST,
      exceptionFactory(errors) {
        const messages = errors.flatMap((error) =>
          error.constraints ? Object.values(error.constraints) : [],
        );
        return new HttpException(
          {
            statusCode: HttpStatus.BAD_REQUEST,
            message: messages,
          },
          HttpStatus.BAD_REQUEST,
        );
      },
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('ANTINO AI')
    .setDescription('ANTINO AI APIs')
    .setVersion('1.0')
    .addTag('antino-ai')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        in: 'header',
      },
      'accessToken',
    )
    .addCookieAuth('accessToken', {
      type: 'apiKey',
      in: 'cookie',
    })
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('antino-ai/api', app, document);

  await app.listen(process.env.PORT);
  const port = process.env.PORT || 3000;
  const host = `http://localhost:${port}`;

  const cyan = (text: string) => `\x1b[36m${text}\x1b[0m`;
  const green = (text: string) => `\x1b[32m${text}\x1b[0m`;
  const yellow = (text: string) => `\x1b[33m${text}\x1b[0m`;

  console.log(
    '\n' + cyan('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'),
  );
  console.log(green('✅  Antino AI Server Bootstrapped Successfully!'));
  console.log(cyan('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
  console.log(`${yellow('📡  Base URL:')}       ${host}/antino-ai`);
  console.log(`${yellow('📘  Swagger Docs:')}   ${host}/antino-ai/api`);
  console.log(
    `${yellow('🕒  Started At:')}      ${new Date().toLocaleString()}`,
  );
  console.log(cyan('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'));
}
bootstrap();
