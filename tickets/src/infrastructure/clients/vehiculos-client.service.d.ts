import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { IVehiculosClient, VehiculoDetalle } from '../../application/ports/vehiculos-client.interface';
export declare class VehiculosClientService implements IVehiculosClient {
    private readonly httpService;
    private readonly configService;
    private readonly logger;
    private readonly baseUrl;
    constructor(httpService: HttpService, configService: ConfigService);
    buscarPorPlaca(placa: string, authHeader?: string): Promise<VehiculoDetalle | null>;
    private mapVehiculo;
}
