import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios'; 
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
import {
  TICKET_CODE_GENERATOR,
} from '../../application/ports/ticket-code-generator.interface';
import { TARIFA_PROVIDER } from '../../application/ports/tarifa-provider.interface';
import { TicketRepository } from 'src/infrastructure/persistence/ticket.repository';
import { TICKET_REPOSITORY } from 'src/application/ports/ticket-repository.interface';

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
    { provide: TICKET_REPOSITORY, useExisting: TicketRepository },
    { provide: USUARIOS_CLIENT, useExisting: UsuariosClientService },
    { provide: VEHICULOS_CLIENT, useExisting: VehiculosClientService },
    { provide: ZONAS_CLIENT, useExisting: ZonasClientService },
    { provide: TICKET_CODE_GENERATOR, useExisting: TicketCodeGeneratorService },
    { provide: TARIFA_PROVIDER, useExisting: TarifaProviderService },
    EmitirTicketUseCase,
    PagarTicketUseCase,
    AnularTicketUseCase,
  ],
})
export class TicketsModule {}