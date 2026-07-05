// vehiculos/vehiculos/vehiculos.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VehiculosController } from './vehiculos.controller';
import { VehiculosService } from './vehiculos.service';
import { Vehiculo } from './entities/vehiculo.entity';
import { Auto } from './entities/tipos/auto.entity';
import { Motocicleta } from './entities/tipos/motocicleta.entity';
import { Camioneta } from './entities/tipos/camioneta.entity';
import { OpaModule } from '../opa/opa.module';  

@Module({
  imports: [
    TypeOrmModule.forFeature([Vehiculo, Auto, Motocicleta, Camioneta]),
    OpaModule, 
  ],
  controllers: [VehiculosController],
  providers: [VehiculosService],
  exports: [VehiculosService],
})
export class VehiculosModule {}