import { Calsificacion } from '../entities/vehiculo.entity';
import { TipoMoto } from '../entities/motocicleta.entity';

export class ResponseVehiculoDto {
  id: string;
  placa: string;
  marca: string;
  modelo: string;
  color: string;
  anio: number;
  clasificacion: Calsificacion;

  // Auto / Carro specific
  numeroPuertas?: number;
  capacidadMaletero?: number;
  tipoCombustible?: string;

  // Moto specific
  tipoMoto?: TipoMoto;

  // Camioneta specific
  cabina?: string;
  capacidadCarga?: number;

  // Bus / Buseta specific
  capacidadPasajeros?: number;
  tieneAccesibilidad?: boolean;
  rutaAsignada?: string;

  constructor(partial?: Partial<ResponseVehiculoDto>) {
    Object.assign(this, partial);
  }
}
