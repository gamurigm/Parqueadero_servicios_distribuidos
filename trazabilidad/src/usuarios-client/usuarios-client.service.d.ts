import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
export declare class UsuariosClientService {
    private readonly httpService;
    private readonly configService;
    private readonly logger;
    private readonly usuariosBaseUrl;
    constructor(httpService: HttpService, configService: ConfigService);
    validarPropietario(userId: string, authHeader?: string): Promise<any>;
    obtenerUsuario(userId: string, authHeader?: string): Promise<any | null>;
}
