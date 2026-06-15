import { IsInt, IsOptional, IsString, Matches, Max, Min } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { CreateVehiculoDto } from './create-vehiculo.dto';

/**
 * Placa de Carro: XXX-0000 (3 letras + guión + 4 dígitos = 7 chars útiles)
 * LSP: es un CreateVehiculoDto válido, sustituible donde se use la base.
 */
export class CreateCarroDto extends CreateVehiculoDto {
  @Matches(/^[A-Z]{3}-\d{4}$/, {
    message: 'Placa de carro inválida. Formato: XXX-0000 (ej: ABC-1234)',
  })
  declare placa: string;

  @IsInt()
  @Min(2)
  @Max(6)
  numeroPuertas: number;

  @IsString()
  @IsOptional()
  tipoCombustible?: string;
}

export class UpdateCarroDto extends PartialType(CreateCarroDto) {}
