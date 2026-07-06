import { Ticket } from '../../domain/ticket.entity';

export const TICKET_REPOSITORY = 'TICKET_REPOSITORY';

export interface ITicketRepository {
  findAll(): Promise<Ticket[]>;
  findById(id: string): Promise<Ticket | null>;
  findByCodigo(codigo: string): Promise<Ticket | null>;
  findActivoByEspacio(idEspacio: string): Promise<Ticket | null>;
  findActivoByPlaca(placa: string): Promise<Ticket | null>;
  save(ticket: Ticket): Promise<Ticket>;
  update(ticket: Ticket): Promise<Ticket>;
}