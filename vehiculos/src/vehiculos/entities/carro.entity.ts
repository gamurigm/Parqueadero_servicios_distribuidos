import { ChildEntity, Column } from 'typeorm';
import { Vehiculo } from './vehiculo.entity';

/** Placa formato XXX-0000 — validado en CreateCarroDto */
@ChildEntity()
export class Carro extends Vehiculo {
  @Column({ type: 'int', nullable: false })
  numeroPuertas: number;

  @Column({ type: 'varchar', nullable: true })
  tipoCombustible: string;

  obtenerTipoCombustion(): string {
    return 'carro';
  }
}
