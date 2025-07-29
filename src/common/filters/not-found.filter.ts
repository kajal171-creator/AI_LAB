import {
  ExceptionFilter,
  Catch,
  NotFoundException,
  ArgumentsHost,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { dirname, join } from 'path';

@Catch(NotFoundException)
export class NotFoundExceptionFilter implements ExceptionFilter {
  catch(exception: NotFoundException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const req = ctx.getRequest<Request>();
    const res = ctx.getResponse<Response>();

    const acceptsHtml = req.headers.accept?.includes('text/html');
    if (acceptsHtml) {
      return res.sendFile(
        join(__dirname, '../../../src/', 'public', '404.html'),
      );
    }

    return res.status(404).json({
      statusCode: 404,
      message: 'Route not found',
      path: req.url,
      timestamp: new Date().toISOString(),
    });
  }
}
