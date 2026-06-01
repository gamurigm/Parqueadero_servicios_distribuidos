import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { IUsuariosClient, VehiculoInfo } from '../../application/ports/usuarios-client.interface';

@Injectable()
export class UsuariosClientService implements IUsuariosClient {
  private readonly logger = new Logger(UsuariosClientService.name);
  private readonly usuariosBaseUrl: string;
  private readonly trazabilidadBaseUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.usuariosBaseUrl = this.configService.get<string>('USUARIOS_SERVICE_URL', 'http://localhost:5000');
    this.trazabilidadBaseUrl = this.configService.get<string>('TRAZABILIDAD_SERVICE_URL', 'http://trazabilidad:3002');
  }

  async obtenerVehiculosPorCedula(cedula: string, authHeader?: string): Promise<VehiculoInfo[]> {
    const headers = authHeader ? { Authorization: authHeader } : undefined;

    try {
      const persona = await this.obtenerPersonaPorCedula(cedula, headers);
      if (!persona?.id) {
        this.logger.warn(`Persona con cedula ${cedula} no encontrada`);
        return [];
      }

      const vehiculosUrl = `${this.trazabilidadBaseUrl}/asignaciones/propietario/${persona.id}`;
      this.logger.log(`Consultando vehiculos asociados a cedula: ${vehiculosUrl}`);
      const resVehiculos = await firstValueFrom(this.httpService.get(vehiculosUrl, { headers }));
      const vehiculos: any[] = Array.isArray(resVehiculos.data) ? resVehiculos.data : [];

      return vehiculos
        .filter((v) => v.placa || v.plate)
        .map((v) => ({
          placa: v.placa || v.plate || '',
          tipo: v.tipo || v.type || 'Automovil',
        }));
    } catch (error) {
      this.logger.error(`Error al consultar vehiculos por cedula ${cedula}: ${error.message}`);
      return [];
    }
  }

  private async obtenerPersonaPorCedula(cedula: string, headers?: Record<string, string>): Promise<any | null> {
    try {
      const url = `${this.usuariosBaseUrl}/persona/cedula/${cedula}`;
      this.logger.log(`Consultando persona por cedula: ${url}`);
      const res = await firstValueFrom(this.httpService.get(url, { headers }));
      return res.data ?? null;
    } catch (error) {
      if (error.response?.status !== 404) {
        this.logger.warn(`Busqueda directa por cedula no disponible: ${error.message}`);
      }
    }

    const url = `${this.usuariosBaseUrl}/persona`;
    this.logger.log(`Consultando personas para buscar cedula: ${url}`);
    const res = await firstValueFrom(this.httpService.get(url, { headers }));
    const personas: any[] = Array.isArray(res.data) ? res.data : [];
    return personas.find((p) => String(p.dni ?? p.cedula ?? '') === cedula) ?? null;
  }
}