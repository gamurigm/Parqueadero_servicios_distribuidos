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

  async buscarPorPlaca(placa: string, authHeader?: string): Promise<VehiculoDetalle | null> {
    const placaNormalizada = placa.trim().toUpperCase();
    const headers = authHeader ? { Authorization: authHeader } : undefined;

    try {
      const url = `${this.baseUrl}/vehiculos/placa/${encodeURIComponent(placaNormalizada)}`;
      this.logger.log(`Buscando vehiculo por placa: ${url}`);
      const res = await firstValueFrom(this.httpService.get(url, { headers }));
      return this.mapVehiculo(res.data, placaNormalizada);
    } catch (error: any) {
      if (error.response?.status !== 404) {
        this.logger.warn(`Busqueda directa por placa no disponible: ${error.message}`);
      }
    }

    try {
      const url = `${this.baseUrl}/vehiculos`;
      this.logger.log(`Buscando vehiculo por placa en listado: ${url}`);
      const res = await firstValueFrom(this.httpService.get(url, { headers }));
      const vehiculos: any[] = Array.isArray(res.data) ? res.data : [];
      const encontrado = vehiculos.find((v) => String(v.placa ?? '').trim().toUpperCase() === placaNormalizada);
      return encontrado ? this.mapVehiculo(encontrado, placaNormalizada) : null;
    } catch (error) {
      this.logger.error(`Error al buscar vehiculo por placa ${placaNormalizada}: ${error.message}`);
      return null;
    }
  }

  private mapVehiculo(data: any, placa: string): VehiculoDetalle | null {
    if (!data) return null;

    return {
      id: data.id || '',
      placa: data.placa || placa,
      tipo: data.tipo || data.type || data.discriminator || 'Automovil',
      cedulaPropietario: data.cedulaPropietario || data.cedula || undefined,
    };
  }
}