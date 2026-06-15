import { ChildEntity, Column } from 'typeorm';
import { Vehiculo } from './vehiculo.entity';

@ChildEntity()
export class Buseta extends Vehiculo {
  @Column({ type: 'int', nullable: false })
  capacidadPasajeros: number;

  @Column({ type: 'varchar', nullable: true })
  rutaAsignada: string;

  obtenerTipoCombustion(): string {
    return 'buseta';
  }
}
