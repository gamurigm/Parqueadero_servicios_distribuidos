import { ITicketRepository } from '../ports/ticket-repository.interface';
import { IUsuariosClient } from '../ports/usuarios-client.interface';
import { IVehiculosClient } from '../ports/vehiculos-client.interface';
import { IZonasClient } from '../ports/zonas-client.interface';
import { ITicketCodeGenerator } from '../ports/ticket-code-generator.interface';
import { ITrazabilidadClient } from '../ports/trazabilidad-client.interface';
import { EventPublisher } from '../../event-publisher.service';
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
export declare class EmitirTicketUseCase {
    private readonly ticketRepo;
    private readonly usuariosClient;
    private readonly vehiculosClient;
    private readonly zonasClient;
    private readonly codeGenerator;
    private readonly trazabilidadClient;
    private readonly eventPublisher;
    private readonly sseService;
    private readonly logger;
    constructor(ticketRepo: ITicketRepository, usuariosClient: IUsuariosClient, vehiculosClient: IVehiculosClient, zonasClient: IZonasClient, codeGenerator: ITicketCodeGenerator, trazabilidadClient: ITrazabilidadClient, eventPublisher: EventPublisher, sseService: SseService);
    execute(input: EmitirTicketInput): Promise<EmitirTicketOutput>;
    private resolverClaveCompuesta;
}
