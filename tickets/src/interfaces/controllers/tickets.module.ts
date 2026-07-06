// tickets.module.ts - VERSIÓN CORREGIDA
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios'; // 👈 Importa HttpModule
import { TicketsController } from './tickets.controller';
import { EmitirTicketUseCase } from '../../application/use-cases/emitir-ticket.use-case';
import { PagarTicketUseCase } from '../../application/use-cases/pagar-ticket.use-case';
import { AnularTicketUseCase } from '../../application/use-cases/anular-ticket.use-case';
import { TicketRepositoryModule } from '../../infrastructure/persistence/ticket-repository.module';
import { UsuariosClientModule } from '../../infrastructure/clients/usuarios-client.module';
import { VehiculosClientModule } from '../../infrastructure/clients/vehiculos-client.module';
import { ZonasClientModule } from '../../infrastructure/clients/zonas-client.module';
import { UsuariosClientService } from '../../infrastructure/clients/usuarios-client.service';
import { VehiculosClientService } from '../../infrastructure/clients/vehiculos-client.service';
import { ZonasClientService } from '../../infrastructure/clients/zonas-client.service';
import { TrazabilidadClientModule } from '../../infrastructure/clients/trazabilidad-client.module';
import { TrazabilidadClientService } from '../../infrastructure/clients/trazabilidad-client.service';
import { TicketCodeGeneratorService } from '../../infrastructure/services/ticket-code-generator.service';
import { TarifaProviderService } from '../../infrastructure/services/tarifa-provider.service';
import { USUARIOS_CLIENT } from '../../application/ports/usuarios-client.interface';
import { VEHICULOS_CLIENT } from '../../application/ports/vehiculos-client.interface';
import { ZONAS_CLIENT } from '../../application/ports/zonas-client.interface';
<<<<<<< HEAD
import { TICKET_CODE_GENERATOR } from '../../application/ports/ticket-code-generator.interface';
=======
import {
  TICKET_CODE_GENERATOR,
} from '../../application/ports/ticket-code-generator.interface';
import { TRAZABILIDAD_CLIENT } from '../../application/ports/trazabilidad-client.interface';
>>>>>>> c1fcd81203b82c3c3faab7c399f9c07c1e843b32
import { TARIFA_PROVIDER } from '../../application/ports/tarifa-provider.interface';

@Module({
  imports: [
    HttpModule,
    TicketRepositoryModule,
    UsuariosClientModule,
    VehiculosClientModule,
    ZonasClientModule,
    TrazabilidadClientModule,
  ],
  controllers: [TicketsController],
  providers: [
<<<<<<< HEAD
    { provide: USUARIOS_CLIENT, useClass: UsuariosClientService },
    { provide: VEHICULOS_CLIENT, useClass: VehiculosClientService },
    { provide: ZONAS_CLIENT, useClass: ZonasClientService },
    { provide: TICKET_CODE_GENERATOR, useClass: TicketCodeGeneratorService },
    { provide: TARIFA_PROVIDER, useClass: TarifaProviderService },
=======
    { provide: TICKET_REPOSITORY, useExisting: TicketRepository },
    { provide: USUARIOS_CLIENT, useExisting: UsuariosClientService },
    { provide: VEHICULOS_CLIENT, useExisting: VehiculosClientService },
    { provide: ZONAS_CLIENT, useExisting: ZonasClientService },
    { provide: TICKET_CODE_GENERATOR, useExisting: TicketCodeGeneratorService },
    { provide: TARIFA_PROVIDER, useExisting: TarifaProviderService },
>>>>>>> c1fcd81203b82c3c3faab7c399f9c07c1e843b32
    EmitirTicketUseCase,
    PagarTicketUseCase,
    AnularTicketUseCase,
  ],
})
export class TicketsModule {}