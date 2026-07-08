import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
export interface JwtPayload {
    iss: string;
    sub: string;
    aud: string;
    exp: number;
    iat: number;
    jti: string;
    username: string;
    roles: string[];
}
declare const JwtStrategy_base: new (...args: any[]) => Strategy;
export declare class JwtStrategy extends JwtStrategy_base {
    constructor(configService: ConfigService);
    validate(payload: JwtPayload): Promise<{
        id: string;
        username: string;
        roles: string[];
        iss: string;
        aud: string;
        jti: string;
    }>;
}
export {};
