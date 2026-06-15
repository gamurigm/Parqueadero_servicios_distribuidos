import { BadRequestException } from '@nestjs/common';
import { CreateVehiculoDto } from '../dto/create-vehiculo.dto';
import { Vehiculo } from '../entities/vehiculo.entity';
import { IVehiculoService } from '../interfaces/vehiculo-service.interface';

/**
 * BaseVehiculoService<T, C>
 *
 * Clase abstracta que implementa la lógica CRUD común para TODOS los vehículos.
 * Patrón Template Method: define el algoritmo en `create` y delega el paso
 * variable (construir la entidad) a `instanciar()` en cada subtipo.
 *
 * SOLID:
 *  SRP : solo contiene lógica de negocio común (CRUD + validación de año).
 *  OCP : subtipos extienden sin modificar esta clase.
 *  LSP : BusService, MotoService… son completamente sustituibles entre sí.
 *  DIP : el Registry depende de IVehiculoService, no de estas clases.
 */
export abstract class BaseVehiculoService<T extends Vehiculo, C extends any>
  implements IVehiculoService<T, C>
{
  protected readonly items: T[] = [];

  private get anioMaximo(): number {
    return new Date().getFullYear() + 1;
  }

  /**
   * Template Method — el único método que cada subtipo DEBE implementar.
   * Recibe el DTO ya validado y devuelve la entidad construida.
   */
  protected abstract instanciar(dto: C): T;

  private validarAnio(anio: number): void {
    if (anio > this.anioMaximo) {
      throw new BadRequestException(
        `El año ${anio} no es válido. Máximo permitido: ${this.anioMaximo}.`,
      );
    }
  }

  // ─── CRUD — definido UNA SOLA VEZ para todos los subtipos ─────────────────

  create(dto: C): T {
    const data = dto as any;
    if (data.anio !== undefined) this.validarAnio(data.anio);
    const entity = this.instanciar(dto);
    this.items.push(entity);
    return entity;
  }

  findAll(): T[] {
    return this.items;
  }

  findOne(id: string): T | undefined {
    return this.items.find((item) => item.id === id);
  }

  update(id: string, dto: Partial<C>): T | undefined {
    const item = this.findOne(id);
    if (!item) return undefined;

    const data = dto as any;
    if (data.anio !== undefined) this.validarAnio(data.anio);

    Object.assign(item, dto);
    return item;
  }

  remove(id: string): boolean {
    const index = this.items.findIndex((item) => item.id === id);
    if (index === -1) return false;
    this.items.splice(index, 1);
    return true;
  }
}
