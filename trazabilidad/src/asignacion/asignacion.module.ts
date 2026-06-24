import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Asignacion } from './entities/asignacion.entity';
import { AsignacionService } from './asignacion.service';
import { AsignacionController } from './asignacion.controller';
import { TrazabilidadModule } from '../trazabilidad/trazabilidad.module';
import { VehiculosClientModule } from '../vehiculos-client/vehiculos-client.module';
import { UsuariosClientModule } from '../usuarios-client/usuarios-client.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Asignacion]),
        TrazabilidadModule,        // Para inyectar TrazabilidadService
        VehiculosClientModule,     // Para inyectar VehiculosClientService (RF3)
        UsuariosClientModule,      // Para validar propietarios (API Usuarios)
    ],
    controllers: [AsignacionController],
    providers: [AsignacionService],
})
export class AsignacionModule {}
