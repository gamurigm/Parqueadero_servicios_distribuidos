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
import {
  ITrazabilidadClient,
  TRAZABILIDAD_CLIENT,
} from '../ports/trazabilidad-client.interface';
import { BusinessError } from '../../domain/errors/business-error';
import { AuditEvent, EventPublisher } from '../../event-publisher.service';

export interface PagarTicketInput {
  idTicket?: string;
  codigoTicket?: string;
  idEmpleado: string;
  username?: string;
  authHeader?: string;
  ip?: string;
  mac?: string;
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
    @Inject(TRAZABILIDAD_CLIENT)
    private readonly trazabilidadClient: ITrazabilidadClient,
    private readonly eventPublisher: EventPublisher,
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

    const vehiculo = await this.vehiculosClient.buscarPorPlaca(ticket.placa, input.authHeader);
    const tipoVehiculo = vehiculo?.tipo || 'Automóvil';

    const espacio = await this.zonasClient.obtenerEspacio(ticket.idEspacio, input.authHeader);
    const tipoEspacio = espacio?.tipo || 'regular';

    const tarifaPorHora = this.tarifaProvider.obtenerTarifaPorHora(tipoVehiculo, tipoEspacio);
    const valor = parseFloat((horasCobradas * tarifaPorHora).toFixed(2));

    ticket.pagar(fechaSalida, valor, input.idEmpleado);
    const updated = await this.ticketRepo.update(ticket);

    let retries = 3;
    while (retries > 0) {
      try {
        await this.zonasClient.marcarLibre(ticket.idEspacio, input.authHeader);
        break;
      } catch (error) {
        retries--;
        if (retries === 0) {
          this.logger.error(`Error crítico al liberar espacio ${ticket.idEspacio} tras pago: ${error.message}. Inconsistencia temporal.`);
        } else {
          this.logger.warn(`Fallo al marcar libre, reintentando... quedan ${retries} intentos`);
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }

    this.trazabilidadClient.registrarEvento({
      microservicio: 'TICKETS',
      endpoint: 'POST /tickets/pagar',
      metodoHttp: 'POST',
      tipoAccion: 'PAGO',
      descripcion: `Se pagó el ticket ${updated.codigoTicket} por valor de $${valor}`,
      entidadId: updated.id,
      usuarioEjecutor: input.idEmpleado,
      payloadAnterior: { estado: 'ACTIVO' },
      payloadNuevo: { estado: 'PAGADO', valorRecaudado: valor, fechaSalida },
    });

    const auditEvent: AuditEvent = {
      servicio: 'ms-tickets',
      accion: 'UPDATE',
      entidad: 'TICKET',
      usuario: input.username || input.idEmpleado,
      ip: input.ip,
      mac: input.mac,
      datos: { id: updated.id, codigoTicket: updated.codigoTicket, estado: 'PAGADO', valorRecaudado: valor, horasCobradas, tarifaPorHora },
    };
    await this.eventPublisher.publish(auditEvent);

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
