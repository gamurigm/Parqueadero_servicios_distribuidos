import { Injectable } from '@nestjs/common';
import { CreateCarroDto } from '../dto/carro.dto';
import { Carro } from '../entities/carro.entity';
import { BaseVehiculoService } from './base-vehiculo.service';

@Injectable()
export class CarroService extends BaseVehiculoService<Carro, CreateCarroDto> {
  protected instanciar(dto: CreateCarroDto): Carro {
    return Object.assign(new Carro(), {
      id: crypto.randomUUID(),
      ...dto,
    });
  }
}
