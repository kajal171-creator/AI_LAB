import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { ClientType } from '../constants/constants'; // adjust path as needed

@Injectable()
export class ClientTypeValidationPipe implements PipeTransform {
  transform(value: string) {
    if (!Object.values(ClientType).includes(value)) {
      throw new BadRequestException(`Invalid client type: ${value}`);
    }
    return value;
  }
}
