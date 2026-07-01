import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ITarifaProvider } from '../../application/ports/tarifa-provider.interface';

@Injectable()
export class TarifaProviderService implements ITarifaProvider {
  private readonly logger = new Logger(TarifaProviderService.name);

  private readonly tarifas: Record<string, number> = {};

  constructor(private readonly configService: ConfigService) {
    this.tarifas['AUTO_REGULAR'] = this.getEnvNum('TARIFA_AUTO_REGULAR', 2.50);
    this.tarifas['AUTO_RESERVADO'] = this.getEnvNum('TARIFA_AUTO_RESERVADO', 5.00);
    this.tarifas['MOTO_REGULAR'] = this.getEnvNum('TARIFA_MOTO_REGULAR', 1.50);
    this.tarifas['MOTO_RESERVADO'] = this.getEnvNum('TARIFA_MOTO_RESERVADO', 3.00);
    this.tarifas['CAMIONETA_REGULAR'] = this.getEnvNum('TARIFA_CAMIONETA_REGULAR', 3.50);
    this.tarifas['CAMIONETA_RESERVADO'] = this.getEnvNum('TARIFA_CAMIONETA_RESERVADO', 6.00);
  }

  obtenerTarifaPorHora(tipoVehiculo: string, tipoEspacio: string): number {
    const tipoV = tipoVehiculo.toUpperCase().replace(/[^A-Z]/g, '');
    const tipoE = tipoEspacio.toUpperCase().replace(/[^A-Z]/g, '');
    const key = `${tipoV}_${tipoE}`;
    const tarifa = this.tarifas[key];
    if (tarifa === undefined) {
      this.logger.warn(`Tarifa no encontrada para ${key}, usando tarifa default AUTO_REGULAR`);
      return this.tarifas['AUTO_REGULAR'] || 2.50;
    }
    return tarifa;
  }

  private getEnvNum(key: string, defaultValue: number): number {
    const val = this.configService.get<string>(key);
    return val ? parseFloat(val) : defaultValue;
  }
}
