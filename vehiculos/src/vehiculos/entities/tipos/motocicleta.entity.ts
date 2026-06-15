import { ChildEntity, Column } from "typeorm";
import { Vehiculo } from "../vehiculo.entity";

export enum TipoMoto {
    DEPORTIVA = 'Deportiva',
    SCOOTER = 'Scooter',
    MOTOCROSS = 'Motocross'
}

@ChildEntity('motocicleta')
export class Motocicleta extends Vehiculo{
    
    @Column({type : 'enum', enum : TipoMoto})
    tipoMoto!: TipoMoto;

    obtenerTipo(): string {
        return 'motocicleta';
    }
}