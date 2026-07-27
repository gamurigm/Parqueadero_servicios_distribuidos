import { ITicketRepository } from '../ports/ticket-repository.interface';
import { IZonasClient } from '../ports/zonas-client.interface';
import { ITarifaProvider } from '../ports/tarifa-provider.interface';
import { IVehiculosClient } from '../ports/vehiculos-client.interface';
import { ITrazabilidadClient } from '../ports/trazabilidad-client.interface';
import { EventPublisher } from '../../event-publisher.service';
import { SseService } from '../../sse/sse.service';
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
export declare class PagarTicketUseCase {
    private readonly ticketRepo;
    private readonly zonasClient;
    private readonly tarifaProvider;
    private readonly vehiculosClient;
    private readonly trazabilidadClient;
    private readonly eventPublisher;
    private readonly sseService;
    private readonly logger;
    constructor(ticketRepo: ITicketRepository, zonasClient: IZonasClient, tarifaProvider: ITarifaProvider, vehiculosClient: IVehiculosClient, trazabilidadClient: ITrazabilidadClient, eventPublisher: EventPublisher, sseService: SseService);
    execute(input: PagarTicketInput): Promise<PagarTicketOutput>;
}
