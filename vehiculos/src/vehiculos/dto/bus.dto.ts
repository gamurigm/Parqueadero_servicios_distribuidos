import { IsBoolean, IsInt, IsOptional, Min } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { CreateVehiculoDto } from './create-vehiculo.dto';

export class CreateBusDto extends CreateVehiculoDto {
  @IsInt()
  @Min(10)
  capacidadPasajeros: number;

  @IsBoolean()
  @IsOptional()
  tieneAccesibilidad?: boolean;
}

export class UpdateBusDto extends PartialType(CreateBusDto) {}
