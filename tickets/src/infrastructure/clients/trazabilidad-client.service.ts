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

  async registrarEvento(dto: RegistrarEventoDto, authHeader?: string): Promise<void> {
    try {
      const url = `${this.trazabilidadUrl}/trazabilidad/registrar`;
      const headers = authHeader ? { Authorization: authHeader } : undefined;
      await firstValueFrom(this.httpService.post(url, dto, { headers }));
    } catch (error) {
      this.logger.error(`Error enviando evento de trazabilidad a ${this.trazabilidadUrl}: ${error.message}`);
    }
  }

  async verificarAsignacionActiva(vehicleId: string, authHeader?: string): Promise<boolean> {
    try {
      const headers = authHeader ? { Authorization: authHeader } : undefined;
      const url = `${this.trazabilidadUrl}/asignaciones`;
      const res = await firstValueFrom(this.httpService.get(url, { headers }));
      const assignments: any[] = Array.isArray(res.data) ? res.data : [];
      const normalizedId = String(vehicleId).trim().toLowerCase();
      return assignments.some((a: any) =>
        String(a?.vehicleId ?? '').trim().toLowerCase() === normalizedId &&
        (a?.estado === 1 || String(a?.estado ?? '').trim() === '1'),
      );
    } catch (error) {
      this.logger.error(`Error verificando asignacion activa para vehiculo ${vehicleId}: ${error.message}`);
      return false;
    }
  }

  async obtenerCedulaPropietario(vehicleId: string, authHeader?: string): Promise<string | undefined> {
    try {
      const headers = authHeader ? { Authorization: authHeader } : undefined;
      const url = `${this.trazabilidadUrl}/asignaciones`;
      const res = await firstValueFrom(this.httpService.get(url, { headers }));
      const assignments: any[] = Array.isArray(res.data) ? res.data : [];
      const normalizedId = String(vehicleId).trim().toLowerCase();
      const activa = assignments.find((a: any) =>
        String(a?.vehicleId ?? '').trim().toLowerCase() === normalizedId &&
        (a?.estado === 1 || String(a?.estado ?? '').trim() === '1'),
      );
      return activa?.propietario?.cedula || activa?.propietario?.dni || undefined;
    } catch (error) {
      this.logger.error(`Error obteniendo cedula propietario para vehiculo ${vehicleId}: ${error.message}`);
      return undefined;
    }
  }
}
