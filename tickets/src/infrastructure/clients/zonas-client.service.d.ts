import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { IZonasClient, EspacioInfo } from '../../application/ports/zonas-client.interface';
export declare class ZonasClientService implements IZonasClient {
    private readonly httpService;
    private readonly configService;
    private readonly logger;
    private readonly baseUrl;
    constructor(httpService: HttpService, configService: ConfigService);
    obtenerEspacio(idEspacio: string, authHeader?: string): Promise<EspacioInfo | null>;
    marcarOcupado(idEspacio: string, authHeader?: string): Promise<void>;
    marcarLibre(idEspacio: string, authHeader?: string): Promise<void>;
    private cambiarEstado;
    private get apiBase();
    private mapEspacio;
}
