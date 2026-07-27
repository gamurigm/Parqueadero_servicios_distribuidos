import { NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
export declare class JweDecryptMiddleware implements NestMiddleware {
    private secret;
    constructor();
    use(req: Request, _res: Response, next: NextFunction): Promise<void>;
}
