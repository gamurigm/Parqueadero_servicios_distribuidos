import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { CreateVehiculoDto } from './create-vehiculo.dto';

export class CreateBusetaDto extends CreateVehiculoDto {
  @IsInt()
  @Min(6)
  @Max(30)
  capacidadPasajeros: number;

  @IsString()
  @IsOptional()
  rutaAsignada?: string;
}

export class UpdateBusetaDto extends PartialType(CreateBusetaDto) {}
