import { IsBoolean, IsEnum, IsIn, IsInt, IsNotEmpty, IsNumber, isNumber, IsString, Matches, Max, min, Min, ValidateNested } from 'class-validator';
import { TipoMoto } from '../entities/motocicleta.entity';
import { Type } from 'class-transformer';
import { Calsificacion } from '../entities/vehiculo.entity';

class BaseVehiculoDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^[A-Z]{3}-\d{3,4}$/, { message: 'La placa debe tener un formato válido (XXX-000 o XXX-0000)' })
  placa!: string;

  @IsString()
  @IsNotEmpty()
  marca: string;

  @IsString()
  @IsNotEmpty()
  modelo: string;

  @IsString()
  @IsNotEmpty()
  color: string;

  @IsNumber()
  @IsInt()
  @Min(1950, { message: 'El anio debe ser mayor o igual a 1950' })
  @Max(2026 + 1, { message: 'El anio debe ser menor o igual a 2027' })
  anio!: number;

  @IsEnum(Calsificacion, {
    message: `La clasificación debe ser una de: ${Object.values(Calsificacion).join(', ')}`
  })
  @IsNotEmpty()
  clasificacion: Calsificacion;
}

export class AutoDto extends BaseVehiculoDto {
  @IsNumber()
  @IsInt()
  @IsNotEmpty()
  @Min(2, { message: 'El numero de puertas debe ser mayor o igual a 2' })
  @Max(5, { message: 'El numero de puertas debe ser menor o igual a 5' })
  numeroPuertas: number;

  @IsNumber()
  @IsInt()
  @IsNotEmpty()
  capacidadMaletero: number;
}

export class MotoDto extends BaseVehiculoDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^[A-Z]{3}-\d{3}$/, {
    message: 'La placa debe tener el formato XXX-000'
  })
  declare placa: string;

  @IsEnum(TipoMoto, {
    message: `El tipo de moto debe ser uno de: ${Object.values(TipoMoto).join(', ')}`
  })
  @IsNotEmpty()
  tipoMoto: TipoMoto;
}

export class CamionetaDto extends BaseVehiculoDto {
  @IsString()
  @IsNotEmpty()
  cabina: string;

  @IsNumber()
  @IsInt()
  @IsNotEmpty()
  @Min(1, { message: 'La capacidad de carga debe ser mayor o igual a 1' })
  capacidadCarga: number;
}

export class BusDto extends BaseVehiculoDto {
  @IsNumber()
  @IsInt()
  @IsNotEmpty()
  capacidadPasajeros: number;

  @IsBoolean()
  tieneAccesibilidad: boolean;
}

export class BusetaDto extends BaseVehiculoDto {
  @IsNumber()
  @IsInt()
  @IsNotEmpty()
  capacidadPasajeros: number;

  @IsString()
  @IsNotEmpty()
  rutaAsignada: string;
}

export class CreateVehiculoDto {
  @IsIn(['auto', 'motocicleta', 'camioneta', 'bus', 'buseta'])
  tipo!: string;

  @ValidateNested()
  @Type((opts) => {
    const object = opts?.object as CreateVehiculoDto;
    if (!object) return BaseVehiculoDto;

    switch (object.tipo) {
      case 'auto':
        return AutoDto;
      case 'motocicleta':
        return MotoDto;
      case 'camioneta':
        return CamionetaDto;
      case 'bus':
        return BusDto;
      case 'buseta':
        return BusetaDto;
      default:
        return BaseVehiculoDto;
    }
  })
  datos!: AutoDto | MotoDto | CamionetaDto | BusDto | BusetaDto;
}
