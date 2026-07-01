import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { IUsuariosClient, VehiculoInfo } from '../../application/ports/usuarios-client.interface';

@Injectable()
export class UsuariosClientService implements IUsuariosClient {
  private readonly logger = new Logger(UsuariosClientService.name);
  private readonly baseUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.baseUrl = this.configService.get<string>('USUARIOS_SERVICE_URL', 'http://localhost:5000');
  }

  async obtenerVehiculosPorCedula(cedula: string): Promise<VehiculoInfo[]> {
    try {
      const url = `${this.baseUrl}/persona/cedula/${cedula}`;
      this.logger.log(`Consultando persona por cédula: ${url}`);
      const res = await firstValueFrom(this.httpService.get(url));
      const persona = res.data;

      if (!persona || !persona.id) {
        this.logger.warn(`Persona con cédula ${cedula} no encontrada`);
        return [];
      }

      const vehiculosUrl = `${this.baseUrl}/vehiculos/persona/${persona.id}`;
      this.logger.log(`Consultando vehículos de persona: ${vehiculosUrl}`);
      const resVehiculos = await firstValueFrom(this.httpService.get(vehiculosUrl));
      const vehiculos: any[] = resVehiculos.data;

      if (!Array.isArray(vehiculos)) return [];

      return vehiculos.map((v) => ({
        placa: v.placa || v.plate || '',
        tipo: v.tipo || v.type || 'Automóvil',
      }));
    } catch (error) {
      this.logger.error(`Error al consultar vehículos por cédula ${cedula}: ${error.message}`);
      return [];
    }
  }
}
