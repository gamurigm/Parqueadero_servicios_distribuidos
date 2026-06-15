import { ChildEntity, Column } from 'typeorm';
import { Vehiculo } from './vehiculo.entity';

@ChildEntity()
export class Bus extends Vehiculo {
  @Column({ type: 'int', nullable: false })
  capacidadPasajeros: number;

  @Column({ type: 'boolean', default: false })
  tieneAccesibilidad: boolean;

  obtenerTipoCombustion(): string {
    return 'bus';
  }
}
