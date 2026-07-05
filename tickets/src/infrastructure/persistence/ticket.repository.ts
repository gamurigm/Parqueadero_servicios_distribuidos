import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { TicketEntity, TicketEstado } from './ticket.entity';
import { ITicketRepository } from '../../application/ports/ticket-repository.interface';
import { Ticket } from '../../domain/ticket.entity';
import { TicketStatus } from '../../domain/ticket-status.enum';

@Injectable()
export class TicketRepository implements ITicketRepository {
  constructor(
    @InjectRepository(TicketEntity)
    private readonly repo: Repository<TicketEntity>,
  ) {}

  async findById(id: string): Promise<Ticket | null> {
    const entity = await this.repo.findOne({ where: { id } });
    return entity ? this.toDomain(entity) : null;
  }

  async findByCodigo(codigo: string): Promise<Ticket | null> {
    const entity = await this.repo.findOne({ where: { codigoTicket: codigo } });
    return entity ? this.toDomain(entity) : null;
  }

  async findActivoByEspacio(idEspacio: string): Promise<Ticket | null> {
    const entity = await this.repo.findOne({
      where: { idEspacio, estado: TicketEstado.ACTIVO },
    });
    return entity ? this.toDomain(entity) : null;
  }

  async findActivoByPlaca(placa: string): Promise<Ticket | null> {
    const entity = await this.repo.findOne({
      where: { placa, estado: TicketEstado.ACTIVO },
    });
    return entity ? this.toDomain(entity) : null;
  }

  async save(ticket: Ticket): Promise<Ticket> {
    const entity = this.toEntity(ticket);
    const saved = await this.repo.save(entity);
    return this.toDomain(saved);
  }

  async update(ticket: Ticket): Promise<Ticket> {
    const entity = this.toEntity(ticket);
    const saved = await this.repo.save(entity);
    return this.toDomain(saved);
  }

  private toDomain(entity: TicketEntity): Ticket {
    return new Ticket(
      entity.id,
      entity.codigoTicket,
      entity.idEspacio,
      entity.cedula,
      entity.placa,
      TicketStatus[entity.estado],
      entity.fechaIngreso,
      entity.idEmpleado,
      entity.fechaSalida,
      entity.valorRecaudado ? Number(entity.valorRecaudado) : undefined,
      entity.motivoAnulacion,
    );
  }

  private toEntity(ticket: Ticket): TicketEntity {
    const entity = new TicketEntity();
    entity.id = ticket.id;
    entity.codigoTicket = ticket.codigoTicket;
    entity.idEspacio = ticket.idEspacio;
    entity.cedula = ticket.cedula;
    entity.placa = ticket.placa;
    entity.estado = TicketEstado[ticket.estado];
    entity.fechaIngreso = ticket.fechaIngreso;
    entity.fechaSalida = ticket.fechaSalida;
    entity.idEmpleado = ticket.idEmpleado;
    entity.valorRecaudado = ticket.valorRecaudado;
    entity.motivoAnulacion = ticket.motivoAnulacion;
    return entity;
  }
}
