import { ExceptionFilter, ArgumentsHost, Logger } from '@nestjs/common';
export declare class GlobalExceptionFilter implements ExceptionFilter {
    private readonly logger;
    constructor(logger: Logger);
    catch(exception: unknown, host: ArgumentsHost): void;
}
