import { Injectable } from '@nestjs/common';
import { CreateCamionDto } from '../dto/camioneta.dto';
import { Camioneta } from '../entities/camioneta.entity';
import { BaseVehiculoService } from './base-vehiculo.service';

@Injectable()
export class CamionService extends BaseVehiculoService<Camioneta, CreateCamionDto> {
  protected instanciar(dto: CreateCamionDto): Camioneta {
    return Object.assign(new Camioneta(), {
      id: crypto.randomUUID(),
      ...dto,
    });
  }
}
