import { Module } from '@nestjs/common';
import { VehiculosService } from './vehiculos.service';
import { VehiculosController } from './vehiculos.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Vehiculo } from './entities/vehiculo.entity';
import { Auto } from './entities/tipos/auto.entity';
import { Motocicleta } from './entities/tipos/motocicleta.entity';
import { Camioneta } from './entities/tipos/camioneta.entity';
import { EventPublisher } from './event-publisher.service';

@Module({
  imports: [TypeOrmModule.forFeature([Vehiculo, Auto, Motocicleta, Camioneta])],
  controllers: [VehiculosController],
  providers: [VehiculosService, EventPublisher],
  exports: [VehiculosService],
})
export class VehiculosModule { }