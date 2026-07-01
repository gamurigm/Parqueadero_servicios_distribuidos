import { Injectable, Inject, Logger } from '@nestjs/common';
import {
  ITicketRepository,
  TICKET_REPOSITORY,
} from '../ports/ticket-repository.interface';
import { IZonasClient, ZONAS_CLIENT } from '../ports/zonas-client.interface';
import {
  ITarifaProvider,
  TARIFA_PROVIDER,
} from '../ports/tarifa-provider.interface';
import {
  IVehiculosClient,
  VEHICULOS_CLIENT,
} from '../ports/vehiculos-client.interface';
import { BusinessError } from '../../domain/errors/business-error';

export interface PagarTicketInput {
  idTicket?: string;
  codigoTicket?: string;
  idEmpleado: string;
}

export interface PagarTicketOutput {
  id: string;
  codigoTicket: string;
  estado: string;
  fechaIngreso: Date;
  fechaSalida: Date;
  valorRecaudado: number;
  horasCobradas: number;
  tarifaPorHora: number;
}

@Injectable()
export class PagarTicketUseCase {
  private readonly logger = new Logger(PagarTicketUseCase.name);

  constructor(
    @Inject(TICKET_REPOSITORY)
    private readonly ticketRepo: ITicketRepository,
    @Inject(ZONAS_CLIENT)
    private readonly zonasClient: IZonasClient,
    @Inject(TARIFA_PROVIDER)
    private readonly tarifaProvider: ITarifaProvider,
    @Inject(VEHICULOS_CLIENT)
    private readonly vehiculosClient: IVehiculosClient,
  ) {}

  async execute(input: PagarTicketInput): Promise<PagarTicketOutput> {
    const ticket = input.idTicket
      ? await this.ticketRepo.findById(input.idTicket)
      : await this.ticketRepo.findByCodigo(input.codigoTicket);

    if (!ticket) {
      throw new BusinessError('Ticket no encontrado');
    }

    if (ticket.estado !== 'ACTIVO') {
      throw new BusinessError(`No se puede pagar un ticket en estado ${ticket.estado}`);
    }

    const fechaSalida = new Date();
    const diffMs = fechaSalida.getTime() - ticket.fechaIngreso.getTime();
    const diffHoras = Math.ceil(diffMs / (1000 * 60 * 60));
    const horasCobradas = Math.max(diffHoras, 1);

    const vehiculo = await this.vehiculosClient.buscarPorPlaca(ticket.placa);
    const tipoVehiculo = vehiculo?.tipo || 'Automóvil';

    const espacio = await this.zonasClient.obtenerEspacio(ticket.idEspacio);
    const tipoEspacio = espacio?.tipo || 'regular';

    const tarifaPorHora = this.tarifaProvider.obtenerTarifaPorHora(tipoVehiculo, tipoEspacio);
    const valor = parseFloat((horasCobradas * tarifaPorHora).toFixed(2));

    ticket.pagar(fechaSalida, valor, input.idEmpleado);
    const updated = await this.ticketRepo.update(ticket);

    try {
      await this.zonasClient.marcarLibre(ticket.idEspacio);
    } catch (error) {
      this.logger.error(`Error al liberar espacio ${ticket.idEspacio}: ${error.message}`);
    }

    return {
      id: updated.id,
      codigoTicket: updated.codigoTicket,
      estado: 'PAGADO',
      fechaIngreso: updated.fechaIngreso,
      fechaSalida: updated.fechaSalida,
      valorRecaudado: updated.valorRecaudado,
      horasCobradas,
      tarifaPorHora,
    };
  }
}
