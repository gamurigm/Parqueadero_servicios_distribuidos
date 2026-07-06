import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventoTrazabilidad } from './entities/trazabilidad.entity';
import { TrazabilidadService } from './trazabilidad.service';
import { TrazabilidadController } from './trazabilidad.controller';
import { VehiculosClientModule } from '../vehiculos-client/vehiculos-client.module';
import { UsuariosClientModule } from '../usuarios-client/usuarios-client.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([EventoTrazabilidad]),
        VehiculosClientModule,     // Para enriquecer trazabilidad con datos de vehículos
        UsuariosClientModule,      // Para enriquecer trazabilidad con datos de usuarios
    ],
    controllers: [TrazabilidadController],
    providers: [TrazabilidadService],
    exports: [TrazabilidadService], // Exportado para usarse en AsignacionModule
})
export class TrazabilidadModule {}

