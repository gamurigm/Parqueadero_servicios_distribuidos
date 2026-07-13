import { Injectable, Inject, Logger } from '@nestjs/common';
import {
  ITicketRepository,
  TICKET_REPOSITORY,
} from '../ports/ticket-repository.interface';
import { IZonasClient, ZONAS_CLIENT } from '../ports/zonas-client.interface';
import {
  ITrazabilidadClient,
  TRAZABILIDAD_CLIENT,
} from '../ports/trazabilidad-client.interface';
import { BusinessError } from '../../domain/errors/business-error';
import { AuditEvent, EventPublisher } from '../../event-publisher.service';

export interface AnularTicketInput {
  idTicket?: string;
  codigoTicket?: string;
  idEmpleado: string;
  username?: string;
  authHeader?: string;
  motivo: string;
  ip?: string;
  mac?: string;
}

export interface AnularTicketOutput {
  id: string;
  codigoTicket: string;
  estado: string;
  motivoAnulacion: string;
}

@Injectable()
export class AnularTicketUseCase {
  private readonly logger = new Logger(AnularTicketUseCase.name);

  constructor(
    @Inject(TICKET_REPOSITORY)
    private readonly ticketRepo: ITicketRepository,
    @Inject(ZONAS_CLIENT)
    private readonly zonasClient: IZonasClient,
    @Inject(TRAZABILIDAD_CLIENT)
    private readonly trazabilidadClient: ITrazabilidadClient,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(input: AnularTicketInput): Promise<AnularTicketOutput> {
    const ticket = input.idTicket
      ? await this.ticketRepo.findById(input.idTicket)
      : await this.ticketRepo.findByCodigo(input.codigoTicket);

    if (!ticket) {
      throw new BusinessError('Ticket no encontrado');
    }

    ticket.anular(input.motivo, input.idEmpleado);
    const updated = await this.ticketRepo.update(ticket);

    let retries = 3;
    while (retries > 0) {
      try {
        await this.zonasClient.marcarLibre(ticket.idEspacio, input.authHeader);
        break;
      } catch (error) {
        retries--;
        if (retries === 0) {
          this.logger.error(`Error crítico al liberar espacio ${ticket.idEspacio} tras anulación: ${error.message}. Inconsistencia temporal.`);
        } else {
          this.logger.warn(`Fallo al marcar libre, reintentando... quedan ${retries} intentos`);
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }

    this.trazabilidadClient.registrarEvento({
      microservicio: 'TICKETS',
      endpoint: 'POST /tickets/anular',
      metodoHttp: 'POST',
      tipoAccion: 'ANULACION',
      descripcion: `Se anuló el ticket ${updated.codigoTicket}. Motivo: ${input.motivo}`,
      entidadId: updated.id,
      usuarioEjecutor: input.idEmpleado,
      payloadAnterior: { estado: 'ACTIVO' },
      payloadNuevo: { estado: 'ANULADO', motivo: input.motivo },
    });

    const auditEvent: AuditEvent = {
      servicio: 'ms-tickets',
      accion: 'UPDATE',
      entidad: 'TICKET',
      usuario: input.username || input.idEmpleado,
      ip: input.ip,
      mac: input.mac,
      datos: { id: updated.id, codigoTicket: updated.codigoTicket, estado: 'ANULADO', motivo: input.motivo },
    };
    await this.eventPublisher.publish(auditEvent);

    return {
      id: updated.id,
      codigoTicket: updated.codigoTicket,
      estado: 'ANULADO',
      motivoAnulacion: input.motivo,
    };
  }
}
