import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { IZonasClient, EspacioInfo } from '../../application/ports/zonas-client.interface';

@Injectable()
export class ZonasClientService implements IZonasClient {
  private readonly logger = new Logger(ZonasClientService.name);
  private readonly baseUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    const configuredUrl = this.configService.get<string>('ZONAS_SERVICE_URL', 'http://localhost:8080');
    this.baseUrl = configuredUrl.replace(/\/$/, '');
  }

  async obtenerEspacio(idEspacio: string, authHeader?: string): Promise<EspacioInfo | null> {
    const headers = authHeader ? { Authorization: authHeader } : undefined;

    try {
      const url = `${this.apiBase}/espacios/`;
      this.logger.log(`Consultando espacios: ${url}`);
      const res = await firstValueFrom(this.httpService.get(url, { headers }));
      const espacios: any[] = Array.isArray(res.data) ? res.data : [];
      const data = espacios.find((e) => String(e.id) === idEspacio || String(e.codigo) === idEspacio);

      if (!data) {
        this.logger.warn(`Espacio ${idEspacio} no encontrado`);
        return null;
      }

      return this.mapEspacio(data, idEspacio);
    } catch (error) {
      this.logger.error(`Error al consultar espacio ${idEspacio}: ${error}`);
      return null;
    }
  }

  async marcarOcupado(idEspacio: string, authHeader?: string): Promise<void> {
    await this.cambiarEstado(idEspacio, 'OCUPADO', authHeader);
  }

  async marcarLibre(idEspacio: string, authHeader?: string): Promise<void> {
    await this.cambiarEstado(idEspacio, 'DISPONIBLE', authHeader);
  }

  private async cambiarEstado(idEspacio: string, estado: 'DISPONIBLE' | 'OCUPADO', authHeader?: string): Promise<void> {
    const headers = authHeader ? { Authorization: authHeader } : undefined;
    const url = `${this.apiBase}/espacios/${encodeURIComponent(idEspacio)}/estado?estado=${estado}`;
    this.logger.log(`Cambiando estado de espacio: ${url}`);
    await firstValueFrom(this.httpService.patch(url, undefined, { headers }));
  }

  private get apiBase(): string {
    return this.baseUrl.endsWith('/api/v1') ? this.baseUrl : `${this.baseUrl}/api/v1`;
  }

  private mapEspacio(data: any, fallbackId: string): EspacioInfo {
    return {
      id: data.id || fallbackId,
      tipo: String(data.tipoEspacio || data.tipo || 'regular').toLowerCase(),
      estado: String(data.estado || 'disponible').toLowerCase(),
    };
  }
}