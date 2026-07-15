import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Asignacion } from './entities/asignacion.entity';
import { AsignacionService } from './asignacion.service';
import { AsignacionController } from './asignacion.controller';
import { TrazabilidadModule } from '../trazabilidad/trazabilidad.module';
import { VehiculosClientModule } from '../vehiculos-client/vehiculos-client.module';
import { UsuariosClientModule } from '../usuarios-client/usuarios-client.module';
import { EventPublisher } from '../event-publisher.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([Asignacion]),
        TrazabilidadModule,
        VehiculosClientModule,
        UsuariosClientModule,
    ],
    controllers: [AsignacionController],
    providers: [AsignacionService, EventPublisher],
})
export class AsignacionModule {}
