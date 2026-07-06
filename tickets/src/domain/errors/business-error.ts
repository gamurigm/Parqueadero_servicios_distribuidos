import { BadRequestException } from '@nestjs/common';

export class BusinessError extends BadRequestException {
  constructor(message: string) {
    super(message);
    this.name = 'BusinessError';
  }
}
