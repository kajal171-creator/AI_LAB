import { Controller, Get } from '@nestjs/common';
import { ResponseMessages } from './common/constants/response-message.constants';

@Controller()
export class AppController {
  constructor() {}

  @Get('health')
  healthCheck(): string {
    return ResponseMessages.HEALTH_CHECK.HEALTH_CHECK_MESSAGE;
  }
}
