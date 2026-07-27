import { ITicketRepository } from '../ports/ticket-repository.interface';
import { IZonasClient } from '../ports/zonas-client.interface';
import { ITrazabilidadClient } from '../ports/trazabilidad-client.interface';
import { EventPublisher } from '../../event-publisher.service';
import { SseService } from '../../sse/sse.service';
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
export declare class AnularTicketUseCase {
    private readonly ticketRepo;
    private readonly zonasClient;
    private readonly trazabilidadClient;
    private readonly eventPublisher;
    private readonly sseService;
    private readonly logger;
    constructor(ticketRepo: ITicketRepository, zonasClient: IZonasClient, trazabilidadClient: ITrazabilidadClient, eventPublisher: EventPublisher, sseService: SseService);
    execute(input: AnularTicketInput): Promise<AnularTicketOutput>;
}
