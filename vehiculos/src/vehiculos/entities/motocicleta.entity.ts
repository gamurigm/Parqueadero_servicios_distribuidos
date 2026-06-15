import { ChildEntity, Column } from 'typeorm';
import { Vehiculo } from './vehiculo.entity';


export enum TipoMoto {
  DEPORTIVA = 'deportiva',
  SCOOTER = 'scooter',
  MOTOCROSS = 'motocross',

}

/** Placa formato XXX-000 — validado en CreateMotoDto */
@ChildEntity()
export class Motocicleta extends Vehiculo {

  @Column({ type: 'enum', enum: TipoMoto })
  tipoMoto: TipoMoto;


  obtenerTipoCombustion(): string {
    return 'motocicleta';
  }
}
