import { Injectable } from '@nestjs/common';
import { CreateMotoDto } from '../dto/moto.dto';
import { Motocicleta } from '../entities/motocicleta.entity';
import { BaseVehiculoService } from './base-vehiculo.service';

@Injectable()
export class MotoService extends BaseVehiculoService<Motocicleta, CreateMotoDto> {
  protected instanciar(dto: CreateMotoDto): Motocicleta {
    return Object.assign(new Motocicleta(), {
      id: crypto.randomUUID(),
      ...dto,
    });
  }
}
