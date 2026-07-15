import { Injectable, Inject, Logger } from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import {
  ITicketRepository,
  TICKET_REPOSITORY,
} from '../ports/ticket-repository.interface';
import {
  IUsuariosClient,
  USUARIOS_CLIENT,
} from '../ports/usuarios-client.interface';
import {
  IVehiculosClient,
  VEHICULOS_CLIENT,
} from '../ports/vehiculos-client.interface';
import { IZonasClient, ZONAS_CLIENT } from '../ports/zonas-client.interface';
import {
  ITicketCodeGenerator,
  TICKET_CODE_GENERATOR,
} from '../ports/ticket-code-generator.interface';
import {
  ITrazabilidadClient,
  TRAZABILIDAD_CLIENT,
} from '../ports/trazabilidad-client.interface';
import { Ticket } from '../../domain/ticket.entity';
import { BusinessError } from '../../domain/errors/business-error';
import { AuditEvent, EventPublisher } from '../../event-publisher.service';
import { SseService } from 'src/sse/sse.service';

export interface EmitirTicketInput {
  idEspacio: string;
  cedula?: string;
  placa?: string;
  idEmpleado: string;
  username?: string;
  authHeader?: string;
  ip?: string;
  mac?: string;
}

export interface EmitirTicketOutput {
  id: string;
  codigoTicket: string;
  idEspacio: string;
  cedula?: string;
  placa: string;
  estado: string;
  fechaIngreso: Date;
  idEmpleado: string;
}

@Injectable()
export class EmitirTicketUseCase {
  private readonly logger = new Logger(EmitirTicketUseCase.name);

  constructor(
    @Inject(TICKET_REPOSITORY)
    private readonly ticketRepo: ITicketRepository,
    @Inject(USUARIOS_CLIENT)
    private readonly usuariosClient: IUsuariosClient,
    @Inject(VEHICULOS_CLIENT)
    private readonly vehiculosClient: IVehiculosClient,
    @Inject(ZONAS_CLIENT)
    private readonly zonasClient: IZonasClient,
    @Inject(TICKET_CODE_GENERATOR)
    private readonly codeGenerator: ITicketCodeGenerator,
    @Inject(TRAZABILIDAD_CLIENT)
    private readonly trazabilidadClient: ITrazabilidadClient,
    private readonly eventPublisher: EventPublisher,
    private readonly sseService: SseService
  ) {}

  async execute(input: EmitirTicketInput): Promise<EmitirTicketOutput> {
    const { idEspacio, cedula, placa, idEmpleado, username, authHeader, ip, mac } = input;

    const resolved = await this.resolverClaveCompuesta(cedula, placa, authHeader);

    const espacio = await this.zonasClient.obtenerEspacio(idEspacio, authHeader);
    if (!espacio) {
      throw new BusinessError(`El espacio ${idEspacio} no existe`);
    }

    const ticketActivoEspacio = await this.ticketRepo.findActivoByEspacio(idEspacio);
    if (ticketActivoEspacio) {
      throw new BusinessError(`El espacio ${idEspacio} ya tiene un ticket activo`);
    }

    const ticketActivoPlaca = await this.ticketRepo.findActivoByPlaca(resolved.placa);
    if (ticketActivoPlaca) {
      throw new BusinessError(`La placa ${resolved.placa} ya tiene un ticket activo en otro espacio`);
    }

    const codigoTicket = this.codeGenerator.generar(idEspacio, espacio.tipo);

    const ticket = Ticket.activo(
      uuid(),
      codigoTicket,
      idEspacio,
      resolved.cedula,
      resolved.placa,
      idEmpleado,
    );

    let saved: Ticket;
    try {
      saved = await this.ticketRepo.save(ticket);
    } catch (error) {
      if (error.message?.includes('duplicate key') || error.message?.includes('unique')) {
        const codigoRetry = this.codeGenerator.generar(idEspacio, espacio.tipo);
        saved = await this.ticketRepo.save(
          Ticket.activo(uuid(), codigoRetry, idEspacio, resolved.cedula, resolved.placa, idEmpleado),
        );
      } else {
        throw error;
      }
    }

    let retries = 3;
    while (retries > 0) {
      try {
        await this.zonasClient.marcarOcupado(idEspacio, authHeader);
        break; // Éxito
      } catch (error) {
        retries--;
        if (retries === 0) {
          this.logger.error(`Error crítico al marcar espacio ${idEspacio} como ocupado: ${error.message}. Inconsistencia temporal.`);
        } else {
          this.logger.warn(`Fallo al marcar ocupado, reintentando... quedan ${retries} intentos`);
          await new Promise(resolve => setTimeout(resolve, 1000)); // 1s backoff
        }
      }
    }

    // Registrar en trazabilidad
    this.trazabilidadClient.registrarEvento({
      microservicio: 'TICKETS',
      endpoint: 'POST /tickets/emitir',
      metodoHttp: 'POST',
      tipoAccion: 'EMISION',
      descripcion: `Se emitió el ticket ${saved.codigoTicket} para placa ${saved.placa} en espacio ${idEspacio}`,
      entidadId: saved.id,
      usuarioEjecutor: idEmpleado,
      payloadNuevo: { id: saved.id, codigoTicket: saved.codigoTicket, placa: saved.placa, idEspacio },
    }, authHeader);

    const auditEvent: AuditEvent = {
      servicio: 'ms-tickets',
      accion: 'CREATE',
      entidad: 'TICKET',
      usuario: username || 'system',
      ip,
      mac,
      datos: { id: saved.id, codigoTicket: saved.codigoTicket, placa: saved.placa, idEspacio, estado: saved.estado },
    };
    await this.eventPublisher.publish(auditEvent);

    await this.sseService.emitEvent('espacio-actualizado', {
      id: saved.idEspacio,
      estado: saved.estado,
    });
    
    return {
      id: saved.id,
      codigoTicket: saved.codigoTicket,
      idEspacio: saved.idEspacio,
      cedula: saved.cedula,
      placa: saved.placa,
      estado: saved.estado,
      fechaIngreso: saved.fechaIngreso,
      idEmpleado: saved.idEmpleado,
    };
  }

  private async resolverClaveCompuesta(
    cedula?: string,
    placa?: string,
    authHeader?: string,
  ): Promise<{ cedula?: string; placa: string }> {
    if (placa) {
      const vehiculo = await this.vehiculosClient.buscarPorPlaca(placa, authHeader);
      if (!vehiculo) {
        throw new BusinessError(`Vehiculo con placa ${placa} no encontrado`);
      }

      const placaResuelta = vehiculo.placa || placa.trim().toUpperCase();

      if (cedula) {
        const vehiculosCedula = await this.usuariosClient.obtenerVehiculosPorCedula(cedula, authHeader);
        if (vehiculosCedula.length === 0) {
          throw new BusinessError(`La cedula ${cedula} no tiene vehiculos asociados`);
        }

        const placaPerteneceACedula = vehiculosCedula.some(
          (v) => String(v.placa ?? '').trim().toUpperCase() === placaResuelta.trim().toUpperCase(),
        );

        if (!placaPerteneceACedula) {
          throw new BusinessError(`La placa ${placaResuelta} no esta asociada a la cedula ${cedula}`);
        }

        return { cedula, placa: placaResuelta };
      }

      return { cedula: vehiculo.cedulaPropietario, placa: placaResuelta };
    }

    if (cedula) {
      const vehiculos = await this.usuariosClient.obtenerVehiculosPorCedula(cedula, authHeader);
      if (vehiculos.length === 0) {
        throw new BusinessError(`La cédula ${cedula} no tiene vehículos asociados`);
      }
      if (vehiculos.length > 1) {
        throw new BusinessError(
          `La cédula ${cedula} tiene ${vehiculos.length} vehículos. Debe especificar la placa`,
        );
      }
      return { cedula, placa: vehiculos[0].placa };
    }

    throw new BusinessError('Debe proporcionar al menos cédula o placa');
  }
}
