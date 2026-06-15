import { TipoMoto } from "../entities/tipos/motocicleta.entity";

export class VehiculoResponseDto{

        id!: string;
    
        placa!: string;
    
        marca!: string;
    
        modelo!: string;
    
        color!: string;
    
        anio!: number;

        clasificacion!: string;

        numeroPuertas!: number;
        
        capacidadMaletero!:number;

        cabina!: string;

        capacidadCarga!: number;

        tipo!: TipoMoto;
}