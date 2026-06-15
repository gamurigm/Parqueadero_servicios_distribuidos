import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateVehiculoDto } from '../dto/create-vehiculo.dto';
import { Vehiculo } from '../entities/vehiculo.entity';
import { IVehiculoService } from '../interfaces/vehiculo-service.interface';
import { TipoVehiculo } from '../enums/tipo-vehiculo.enum';

interface RegistroEntrada {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  service: IVehiculoService<Vehiculo, any>;
  dtoClass: new () => CreateVehiculoDto;
}

/**
 * VehiculoRegistry — patrón Strategy.
 *
 * Centraliza el mapeo  TipoVehiculo → { servicio, DTO }.
 * VehiculosController delega TODO aquí y NUNCA importa un servicio concreto.
 *
 * SOLID:
 *  SRP : resuelve qué servicio/DTO corresponde a cada tipo.
 *  OCP : nuevo tipo → registrar(), sin tocar controller ni registry.
 *  DIP : controller depende de este registro (abstracción), no de BusService etc.
 *
 * ─── Cómo agregar "Camion" ──────────────────────────────────────────────────
 *  1. CamionService extends BaseVehiculoService<Camion, CreateCamionDto>
 *  2. TipoVehiculo.CAMION = 'camion'  (una línea en el enum)
 *  3. registry.registrar(TipoVehiculo.CAMION, camionService, CreateCamionDto)
 *  ✅ VehiculosController: 0 cambios.
 * ────────────────────────────────────────────────────────────────────────────
 */
@Injectable()
export class VehiculoRegistry {
  private readonly mapa = new Map<TipoVehiculo, RegistroEntrada>();

  registrar(
    tipo: TipoVehiculo,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    service: IVehiculoService<Vehiculo, any>,
    dtoClass: new () => CreateVehiculoDto,
  ): void {
    this.mapa.set(tipo, { service, dtoClass });
  }

  private entrada(tipo: TipoVehiculo): RegistroEntrada {
    const e = this.mapa.get(tipo);
    if (!e) {
      throw new NotFoundException(
        `Tipo '${tipo}' no registrado. Válidos: ${Object.values(TipoVehiculo).join(', ')}`,
      );
    }
    return e;
  }

  // ─── CRUD — el controller llama SOLO estos métodos ────────────────────────

  async crear(tipo: TipoVehiculo, body: object): Promise<Vehiculo> {
    const { service, dtoClass } = this.entrada(tipo);
    const dto = plainToInstance(dtoClass, body ?? {});
    const errores = await validate(dto);
    if (errores.length > 0) {
      throw new BadRequestException(
        errores.flatMap((e) => Object.values(e.constraints ?? {})),
      );
    }
    return service.create(dto);
  }

  listar(tipo: TipoVehiculo): Vehiculo[] {
    return this.entrada(tipo).service.findAll();
  }

  obtener(tipo: TipoVehiculo, id: string): Vehiculo {
    const v = this.entrada(tipo).service.findOne(id);
    if (!v) throw new NotFoundException(`${tipo} con id "${id}" no encontrado`);
    return v;
  }

  async actualizar(tipo: TipoVehiculo, id: string, body: object): Promise<Vehiculo> {
    const { service, dtoClass } = this.entrada(tipo);
    const dto = plainToInstance(dtoClass, body ?? {});
    const errores = await validate(dto, { skipMissingProperties: true });
    if (errores.length > 0) {
      throw new BadRequestException(
        errores.flatMap((e) => Object.values(e.constraints ?? {})),
      );
    }
    const v = service.update(id, dto);
    if (!v) throw new NotFoundException(`${tipo} con id "${id}" no encontrado`);
    return v;
  }

  eliminar(tipo: TipoVehiculo, id: string): { message: string } {
    if (!this.entrada(tipo).service.remove(id)) {
      throw new NotFoundException(`${tipo} con id "${id}" no encontrado`);
    }
    return { message: `${tipo} "${id}" eliminado correctamente` };
  }
}
