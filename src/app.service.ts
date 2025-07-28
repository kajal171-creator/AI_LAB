import { Injectable } from '@nestjs/common';
//hello world
@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }
}
