import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
export interface VehiculoDetalle {
    id: string;
    tipo: string;
    categoria: string;
    marca?: string;
    modelo?: string;
    placa?: string;
    [key: string]: any;
}
export declare class VehiculosClientService {
    private readonly httpService;
    private readonly configService;
    private readonly logger;
    private readonly vehiculosBaseUrl;
    constructor(httpService: HttpService, configService: ConfigService);
    getVehiculo(vehicleId: string): Promise<VehiculoDetalle | null>;
    checkHealth(): Promise<boolean>;
}
