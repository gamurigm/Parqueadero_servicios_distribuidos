import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { ITrazabilidadClient, RegistrarEventoDto } from '../../application/ports/trazabilidad-client.interface';

@Injectable()
export class TrazabilidadClientService implements ITrazabilidadClient {
  private readonly logger = new Logger(TrazabilidadClientService.name);
  private readonly trazabilidadUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.trazabilidadUrl = this.configService.get<string>('TRAZABILIDAD_SERVICE_URL', 'http://trazabilidad:3002');
  }

  async registrarEvento(dto: RegistrarEventoDto): Promise<void> {
    try {
      const url = `${this.trazabilidadUrl}/trazabilidad/registrar`;
      // Enviar de forma asíncrona ("fire and forget" en este caso, o esperar si falla logged)
      await firstValueFrom(this.httpService.post(url, dto));
    } catch (error) {
      this.logger.error(`Error enviando evento de trazabilidad a ${this.trazabilidadUrl}: ${error.message}`);
    }
  }
}
