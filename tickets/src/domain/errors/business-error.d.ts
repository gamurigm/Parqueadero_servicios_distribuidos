import { BadRequestException } from '@nestjs/common';
export declare class BusinessError extends BadRequestException {
    constructor(message: string);
}
