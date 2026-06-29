import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventoTrazabilidad } from './entities/trazabilidad.entity';
import { TrazabilidadService } from './trazabilidad.service';

@Module({
    imports: [TypeOrmModule.forFeature([EventoTrazabilidad])],
    providers: [TrazabilidadService],
    exports: [TrazabilidadService], // Exportado para usarse en AsignacionModule
})
export class TrazabilidadModule {}
