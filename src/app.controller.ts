import {
  All,
  Controller,
  Get,
  NotFoundException,
  Req,
  Res,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { ResponseMessages } from './common/constants/response-message.constants';
import { join } from 'path';
import { ApiExcludeEndpoint } from '@nestjs/swagger';

@Controller()
export class AppController {
  @Get('health')
  healthCheck(@Req() req: Request, @Res() res: Response) {
    const acceptHeader = req.headers['accept'] || '';

    if (acceptHeader.includes('text/html')) {
      return res.sendFile(
        join(__dirname, '../src', 'public', 'health-check.html'),
      );
    }

    return res.status(200).json({
      statusCode: 200,
      message: ResponseMessages.HEALTH_CHECK.HEALTH_CHECK_MESSAGE,
      timestamp: new Date().toISOString(),
    });
  }

  @All('*')
  @ApiExcludeEndpoint()
  handleUnknownRoutes(@Req() req: Request, @Res() res: Response) {
    throw new NotFoundException();
  }
}
