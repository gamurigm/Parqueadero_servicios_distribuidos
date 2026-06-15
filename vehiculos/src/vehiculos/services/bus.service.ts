import { Injectable } from '@nestjs/common';
import { CreateBusDto } from '../dto/bus.dto';
import { Bus } from '../entities/bus.entity';
import { BaseVehiculoService } from './base-vehiculo.service';

@Injectable()
export class BusService extends BaseVehiculoService<Bus, CreateBusDto> {
  protected instanciar(dto: CreateBusDto): Bus {
    return Object.assign(new Bus(), {
      id: crypto.randomUUID(),
      tieneAccesibilidad: false,
      ...dto,
    });
  }
}
