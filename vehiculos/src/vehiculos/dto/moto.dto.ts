import { IsEnum, IsNotEmpty, IsString, Matches } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { CreateVehiculoDto } from './create-vehiculo.dto';
import { TipoMoto } from '../entities/motocicleta.entity';

/**
 * Placa de Moto: XXX-000 (3 letras + guión + 3 dígitos = 6 chars útiles)
 * LSP: es un CreateVehiculoDto válido, sustituible donde se use la base.
 */
export class CreateMotoDto extends CreateVehiculoDto {
  @Matches(/^[A-Z]{3}-\d{3}$/, {
    message: 'Placa de moto inválida. Formato: XXX-000 (ej: ABC-123)',
  })
  declare placa: string;

  @IsString()
  @IsNotEmpty()
  cilindraje: string;

  @IsEnum(TipoMoto, {
    message: `El tipo de moto debe ser uno de: ${Object.values(TipoMoto).join(', ')}`
  })
  @IsNotEmpty()
  tipoMoto: TipoMoto;
}

export class UpdateMotoDto extends PartialType(CreateMotoDto) {}
