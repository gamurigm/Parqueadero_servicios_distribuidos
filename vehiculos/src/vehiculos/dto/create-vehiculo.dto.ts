import { IsDecimal, IsEnum, IsIn, IsInt, IsNotEmpty, IsString, Matches, Max, MaxLength, Min, MinLength, ValidateNested } from "class-validator";
import { TipoMoto } from "../entities/tipos/motocicleta.entity";
import { Type } from 'class-transformer';
import { Clasificacion } from "../entities/vehiculo.entity";

class BaseVehiculoDto{
    @IsString()
    @IsNotEmpty()
    @Matches(/^{A-Z}{3}-\D{3,4}$/,{
        message :'La placa debe tener un formato válido (PVZ-1234)'})
    placa!: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(2,{
        message: 'La marca debe tener al menos 2 caracteres'
    })
    @MaxLength(30,{
        message: 'La marca debe tener menos de 30 caracteres'
    })
    @Matches(/^[A-Za-z\s\-áéíóúÁÉÍÓÚñÑ]+$/,{
        message: 'La marca solo puede contener letras y espacios'
    })
    marca!:string;

    @IsString()
    @IsNotEmpty()
    @MinLength(2,{
        message: 'La modelo debe tener al menos 2 caracteres'
    })
    @MaxLength(150,{
        message: 'La modelo debe tener menos de 150 caracteres'
    })
    @Matches(/^[A-Za-z0-9áéíóúÁÉÍÓÚñÑ\s\-]+$/,{
        message: 'La modelo solo puede contener letras y espacios'
    })
    modelo!:string;

    @IsString()
    @IsNotEmpty()
    @MinLength(2,{
        message: 'La color debe tener al menos 2 caracteres'
    })
    @MaxLength(30,{
        message: 'La color debe tener menos de 30 caracteres'
    })
    @Matches(/^[A-Za-z\s\-áéíóúÁÉÍÓÚñÑ]+$/,{
        message: 'La color solo puede contener letras y espacios'
    })
    color!:string;

    @Min(1885,{
        message: 'El año debe ser mayor o igual a 1885'
    })
    @IsInt({message: 'El año debe ser un número entero'})
    @Matches(/^[0-9]+$/,{
        message: 'La año solo puede contener números'
    })
    @Max(new Date().getFullYear() + 1,{
        message: `El año debe ser menor o igual a ${new Date().getFullYear()}`
    })
    @IsNotEmpty()
    anio!: number;

    @IsEnum(Clasificacion, {
        message: 'La clasificación debe ser: Electrico, Hibrido, Gasolina o Diesel'
    })
    @IsNotEmpty()
    clasificacion!: string; 
}

class AutoDto extends BaseVehiculoDto{
    @IsInt()
    @Min(2,{
        message: "El nuemro de puertas minimo es 2"
    })
    @IsNotEmpty()
    @Max(7,{
        message: "El numero de puertas maximo es 7"
    })
    numeroPuertas!: number;

    @IsDecimal()
    @Min(0,{
        message: "La capacidad del maletero debe ser mayor a 1 kg"
    })
    @IsNotEmpty()
    @Max(1000,{
        message: "La capacidad del maletero no puede exceder 1000"
    })
    capacidadMaletero!:number;
}

class MotocicletaDto extends BaseVehiculoDto{
    @IsString()
    @IsNotEmpty()
    @Matches(/^{A-Z}{2}-\d{0-9}{3}[A-Z]$/,{
        message: 'La placa debe ser el siguiente formato (GG-420A)'
    })
    declare placa: string;

    @IsNotEmpty()
    @IsEnum(TipoMoto,{
        message: 'El tipo de motocicleta debe ser Deportiva, Scooter o Motocross'
    })
    tipo!: string;
}

class CamionetaDto extends BaseVehiculoDto{
    @IsNotEmpty()
    @IsString()
    @MinLength(5,{
        message:'La cabina no puede tener menos de 5 caracteres'})
    cabina!: string;
    
    @IsDecimal()
    @Min(0,{
        message: "La capacidad de carga debe ser mayor a 1 kg"
    })
    @IsNotEmpty()
    @Max(10000,{
        message: "La capacidad de carga no puede exceder 10000 kg"
    })
    capacidadCarga!: number;
}

export class CreateVehiculoDto {
  @IsIn(['auto', 'motocicleta', 'camioneta'])
  tipo!: string;

  @ValidateNested()
  @Type((opts) => {
    const object = opts?.object as CreateVehiculoDto;
    if (!object) return BaseVehiculoDto;

    switch (object.tipo) {
      case 'auto':
        return AutoDto;
      case 'motocicleta':
        return MotocicletaDto;
      case 'camioneta':
        return CamionetaDto;
      default:
        return BaseVehiculoDto;
    }
  })
  datos!: AutoDto | MotocicletaDto | CamionetaDto;
}