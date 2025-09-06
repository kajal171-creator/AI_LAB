import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { CLIENT_TYPE } from '../constants/constants'; // adjust path as needed

@Injectable()
export class ClientTypeValidationPipe implements PipeTransform {
  transform(value: string) {
    if (!Object.values(CLIENT_TYPE).includes(value)) {
      throw new BadRequestException(`Invalid client type: ${value}`);
    }
    return value;
  }
}
