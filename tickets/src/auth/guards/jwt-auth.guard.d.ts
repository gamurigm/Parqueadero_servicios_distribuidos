import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { OpaService } from '../../opa/opa.service';
export declare const IS_PUBLIC_KEY = "isPublic";
declare const JwtAuthGuard_base: import("@nestjs/passport").Type<import("@nestjs/passport").IAuthGuard>;
export declare class JwtAuthGuard extends JwtAuthGuard_base {
    private reflector;
    private opaService;
    constructor(reflector: Reflector, opaService: OpaService);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
export {};
