import { CreateVehiculoDto } from '../dto/create-vehiculo.dto';
import { Vehiculo } from '../entities/vehiculo.entity';

/**
 * IVehiculoService<T, C>
 *
 * Contrato que deben cumplir TODOS los servicios de vehículos.
 *
 * DIP : los consumidores (Registry, tests) dependen de esta interfaz,
 *       nunca de las implementaciones concretas.
 * LSP : cualquier clase que implemente esta interfaz puede sustituirse
 *       donde se use IVehiculoService sin alterar el comportamiento.
 */
export interface IVehiculoService<T extends Vehiculo, C> {
  create(dto: C): T;
  findAll(): T[];
  findOne(id: string): T | undefined;
  update(id: string, dto: Partial<C>): T | undefined;
  remove(id: string): boolean;
}
