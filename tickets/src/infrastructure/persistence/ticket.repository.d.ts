import { Repository, DataSource } from 'typeorm';
import { TicketEntity } from './ticket.entity';
import { ITicketRepository } from '../../application/ports/ticket-repository.interface';
import { Ticket } from '../../domain/ticket.entity';
export declare class TicketRepository implements ITicketRepository {
    private readonly repo;
    private readonly dataSource;
    constructor(repo: Repository<TicketEntity>, dataSource: DataSource);
    findAll(): Promise<Ticket[]>;
    findById(id: string): Promise<Ticket | null>;
    findByCodigo(codigo: string): Promise<Ticket | null>;
    findActivoByEspacio(idEspacio: string): Promise<Ticket | null>;
    findActivoByPlaca(placa: string): Promise<Ticket | null>;
    save(ticket: Ticket): Promise<Ticket>;
    update(ticket: Ticket): Promise<Ticket>;
    private toDomain;
    private toEntity;
}
