import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { IVehiculosClient, VehiculoDetalle } from '../../application/ports/vehiculos-client.interface';

@Injectable()
export class VehiculosClientService implements IVehiculosClient {
  private readonly logger = new Logger(VehiculosClientService.name);
  private readonly baseUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.baseUrl = this.configService.get<string>('VEHICULOS_SERVICE_URL', 'http://localhost:3000');
  }

  async buscarPorPlaca(placa: string): Promise<VehiculoDetalle | null> {
    try {
      const url = `${this.baseUrl}/vehiculos/placa/${placa}`;
      this.logger.log(`Buscando vehículo por placa: ${url}`);
      const res = await firstValueFrom(this.httpService.get(url));

      if (!res.data) return null;

      const dto: VehiculoDetalle = {
        id: res.data.id || '',
        placa: res.data.placa || placa,
        tipo: res.data.tipo || 'Automóvil',
        cedulaPropietario: res.data.cedulaPropietario || res.data.cedula || '',
      };
      return dto;
    } catch (error) {
      if (error.response?.status === 404) {
        this.logger.warn(`Vehículo con placa ${placa} no encontrado`);
        return null;
      }
      this.logger.error(`Error al buscar vehículo por placa ${placa}: ${error.message}`);
      return null;
    }
  }
}
