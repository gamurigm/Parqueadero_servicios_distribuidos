import { ApiProperty } from "@nestjs/swagger";
import { TipoMoto } from "../entities/tipos/motocicleta.entity";

export class VehiculoResponseDto{

        @ApiProperty()
        id!: string;
    
        @ApiProperty()
        placa!: string;
    
        @ApiProperty()
        marca!: string;
    
        @ApiProperty()
        modelo!: string;
    
        @ApiProperty()
        color!: string;
    
        @ApiProperty()
        anio!: number;

        @ApiProperty()
        clasificacion!: string;

        @ApiProperty()
        numeroPuertas!: number;
        
        @ApiProperty()
        capacidadMaletero!:number;

        @ApiProperty()
        cabina!: string;

        @ApiProperty()
        capacidadCarga!: number;

        @ApiProperty()
        tipo!: TipoMoto;
}