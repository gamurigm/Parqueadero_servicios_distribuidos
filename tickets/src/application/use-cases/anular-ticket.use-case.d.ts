import { ITicketRepository } from '../ports/ticket-repository.interface';
import { IZonasClient } from '../ports/zonas-client.interface';
import { ITrazabilidadClient } from '../ports/trazabilidad-client.interface';
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
export declare class AnularTicketUseCase {
    private readonly ticketRepo;
    private readonly zonasClient;
    private readonly trazabilidadClient;
    private readonly logger;
    constructor(ticketRepo: ITicketRepository, zonasClient: IZonasClient, trazabilidadClient: ITrazabilidadClient);
    execute(input: AnularTicketInput): Promise<AnularTicketOutput>;
}
