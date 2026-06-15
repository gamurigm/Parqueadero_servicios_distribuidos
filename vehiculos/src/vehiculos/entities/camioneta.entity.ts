import { ChildEntity, Column } from 'typeorm';
import { Vehiculo } from './vehiculo.entity';

/** Placa formato XXX-0000 (validado en DTO) y capacidad de carga */
@ChildEntity()
export class Camioneta extends Vehiculo {

  @Column({ type: 'varchar', nullable: false })
  cabina!: string;

  @Column()
  capacidadCarga: number;


  obtenerTipoCombustion(): string {
    return 'camioneta';
  }
}
