import { ConfigService } from '@nestjs/config';
import { ITarifaProvider } from '../../application/ports/tarifa-provider.interface';
export declare class TarifaProviderService implements ITarifaProvider {
    private readonly configService;
    private readonly logger;
    private readonly tarifas;
    constructor(configService: ConfigService);
    obtenerTarifaPorHora(tipoVehiculo: string, tipoEspacio: string): number;
    private getEnvNum;
}
