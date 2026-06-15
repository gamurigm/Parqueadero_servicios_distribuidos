import { IsInt, IsNotEmpty, IsNumber, Matches, Min } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { CreateVehiculoDto } from './create-vehiculo.dto';

export class CreateCamionDto extends CreateVehiculoDto {
  @Matches(/^[A-Z]{3}-\d{4}$/, {
    message: 'Placa de camión inválida. Formato: XXX-0000 (ej: ABC-1234)',
  })
  declare placa: string;

  @IsNumber()
  @Min(1)
  capacidadCargaToneladas: number;

  @IsInt()
  @Min(2)
  numeroEjes: number;
}

export class UpdateCamionDto extends PartialType(CreateCamionDto) {}
