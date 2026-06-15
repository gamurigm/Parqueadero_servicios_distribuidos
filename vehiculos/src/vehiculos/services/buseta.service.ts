import { Injectable } from '@nestjs/common';
import { CreateBusetaDto } from '../dto/buseta.dto';
import { Buseta } from '../entities/buseta.entity';
import { BaseVehiculoService } from './base-vehiculo.service';

@Injectable()
export class BusetaService extends BaseVehiculoService<Buseta, CreateBusetaDto> {
  protected instanciar(dto: CreateBusetaDto): Buseta {
    return Object.assign(new Buseta(), {
      id: crypto.randomUUID(),
      ...dto,
    });
  }
}
