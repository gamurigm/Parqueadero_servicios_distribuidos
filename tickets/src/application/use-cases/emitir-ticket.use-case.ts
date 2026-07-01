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
import { Ticket } from '../../domain/ticket.entity';
import { BusinessError } from '../../domain/errors/business-error';

export interface EmitirTicketInput {
  idEspacio: string;
  cedula?: string;
  placa?: string;
  idEmpleado: string;
}

export interface EmitirTicketOutput {
  id: string;
  codigoTicket: string;
  idEspacio: string;
  cedula: string;
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
  ) {}

  async execute(input: EmitirTicketInput): Promise<EmitirTicketOutput> {
    const { idEspacio, cedula, placa, idEmpleado } = input;

    const resolved = await this.resolverClaveCompuesta(cedula, placa);

    const espacio = await this.zonasClient.obtenerEspacio(idEspacio);
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

    try {
      await this.zonasClient.marcarOcupado(idEspacio);
    } catch (error) {
      this.logger.error(`Error al marcar espacio ${idEspacio} como ocupado: ${error.message}`);
    }

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
  ): Promise<{ cedula: string; placa: string }> {
    if (placa) {
      const vehiculo = await this.vehiculosClient.buscarPorPlaca(placa);
      if (!vehiculo) {
        throw new BusinessError(`Vehículo con placa ${placa} no encontrado`);
      }
      if (!vehiculo.cedulaPropietario) {
        throw new BusinessError(`La placa ${placa} no tiene un propietario asignado`);
      }
      return { cedula: vehiculo.cedulaPropietario, placa };
    }

    if (cedula) {
      const vehiculos = await this.usuariosClient.obtenerVehiculosPorCedula(cedula);
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
