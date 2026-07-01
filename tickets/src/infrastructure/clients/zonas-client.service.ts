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
    this.baseUrl = this.configService.get<string>('ZONAS_SERVICE_URL', 'http://localhost:8080');
  }

  async obtenerEspacio(idEspacio: string): Promise<EspacioInfo | null> {
    try {
      const url = `${this.baseUrl}/espacios/${idEspacio}`;
      this.logger.log(`Consultando espacio: ${url}`);
      const res = await firstValueFrom(this.httpService.get(url));
      const data = res.data;

      return {
        id: data.id || idEspacio,
        tipo: (data.tipo || 'regular').toLowerCase(),
        estado: (data.estado || 'libre').toLowerCase(),
      };
    } catch (error) {
      if (error.response?.status === 404) {
        this.logger.warn(`Espacio ${idEspacio} no encontrado`);
        return null;
      }
      this.logger.error(`Error al consultar espacio ${idEspacio}: ${error.message}`);
      return null;
    }
  }

  async marcarOcupado(idEspacio: string): Promise<void> {
    try {
      const url = `${this.baseUrl}/espacios/${idEspacio}/ocupar`;
      this.logger.log(`Marcando espacio como ocupado: ${url}`);
      await firstValueFrom(this.httpService.patch(url));
    } catch (error) {
      this.logger.error(`Error al marcar espacio ${idEspacio} como ocupado: ${error.message}`);
      throw error;
    }
  }

  async marcarLibre(idEspacio: string): Promise<void> {
    try {
      const url = `${this.baseUrl}/espacios/${idEspacio}/liberar`;
      this.logger.log(`Marcando espacio como libre: ${url}`);
      await firstValueFrom(this.httpService.patch(url));
    } catch (error) {
      this.logger.error(`Error al liberar espacio ${idEspacio}: ${error.message}`);
      throw error;
    }
  }
}
