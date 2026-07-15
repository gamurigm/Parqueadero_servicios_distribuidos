import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { ITrazabilidadClient, RegistrarEventoDto } from '../../application/ports/trazabilidad-client.interface';
export declare class TrazabilidadClientService implements ITrazabilidadClient {
    private readonly httpService;
    private readonly configService;
    private readonly logger;
    private readonly trazabilidadUrl;
    constructor(httpService: HttpService, configService: ConfigService);
    registrarEvento(dto: RegistrarEventoDto): Promise<void>;
}
