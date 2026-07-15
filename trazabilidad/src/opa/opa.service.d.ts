import { ConfigService } from '@nestjs/config';
export interface OpaToken {
    iss: string;
    sub: string;
    aud: string;
    jti: string;
    iat?: number;
    exp?: number;
}
export interface OpaInput {
    token?: OpaToken;
    user: {
        id: string;
        username: string;
        roles: string[];
    };
    resource: string;
    action: string;
    context: {
        ip: string;
        method: string;
        path: string;
    };
}
export declare class OpaService {
    private configService;
    private readonly logger;
    private readonly opaUrl;
    private readonly serviceName;
    constructor(configService: ConfigService);
    checkPermission(input: OpaInput): Promise<boolean>;
}
