import { Injectable, Inject, Logger, NotFoundException, ConflictException } from '@nestjs/common';
import {
  ITicketRepository,
  TICKET_REPOSITORY,
} from '../ports/ticket-repository.interface';
import { IZonasClient, ZONAS_CLIENT } from '../ports/zonas-client.interface';
import { BusinessError } from '../../domain/errors/business-error';

export interface AnularTicketInput {
  idTicket?: string;
  codigoTicket?: string;
  idEmpleado: string;
  motivo: string;
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
  ) {}

  async execute(input: AnularTicketInput): Promise<AnularTicketOutput> {
    const ticket = input.idTicket
      ? await this.ticketRepo.findById(input.idTicket)
      : await this.ticketRepo.findByCodigo(input.codigoTicket);

    if (!ticket) {
      throw new NotFoundException('Ticket no encontrado');
    }

    ticket.anular(input.motivo, input.idEmpleado);
    const updated = await this.ticketRepo.update(ticket);

    try {
      await this.zonasClient.marcarLibre(ticket.idEspacio);
    } catch (error) {
      this.logger.error(`Error al liberar espacio ${ticket.idEspacio} tras anulación: ${error instanceof Error ? error.message : String(error)}`);
    }

    return {
      id: updated.id,
      codigoTicket: updated.codigoTicket,
      estado: 'ANULADO',
      motivoAnulacion: input.motivo,
    };
  }
}
