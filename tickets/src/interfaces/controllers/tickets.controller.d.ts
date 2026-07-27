import { EmitirTicketUseCase } from '../../application/use-cases/emitir-ticket.use-case';
import { PagarTicketUseCase } from '../../application/use-cases/pagar-ticket.use-case';
import { AnularTicketUseCase } from '../../application/use-cases/anular-ticket.use-case';
import { ITicketRepository } from '../../application/ports/ticket-repository.interface';
import { EmitirTicketRequestDto } from '../dto/request/emitir-ticket-request.dto';
import { PagarTicketRequestDto } from '../dto/request/pagar-ticket-request.dto';
import { AnularTicketRequestDto } from '../dto/request/anular-ticket-request.dto';
import { TicketResponseDto } from '../dto/response/ticket-response.dto';
import { PagoResponseDto } from '../dto/response/pago-response.dto';
import { SseService } from '../../sse/sse.service';
export declare class TicketsController {
    private readonly emitirUseCase;
    private readonly pagarUseCase;
    private readonly anularUseCase;
    private readonly ticketRepo;
    private readonly sseService;
    constructor(emitirUseCase: EmitirTicketUseCase, pagarUseCase: PagarTicketUseCase, anularUseCase: AnularTicketUseCase, ticketRepo: ITicketRepository, sseService: SseService);
    emitir(dto: EmitirTicketRequestDto, req: any, mac?: string): Promise<TicketResponseDto>;
    pagar(dto: PagarTicketRequestDto, req: any, mac?: string): Promise<PagoResponseDto>;
    anular(dto: AnularTicketRequestDto, req: any, mac?: string): Promise<TicketResponseDto>;
    listarTodos(): Promise<TicketResponseDto[]>;
    obtenerPorCodigo(codigo: string): Promise<TicketResponseDto>;
    obtener(id: string): Promise<TicketResponseDto>;
    eliminar(id: string): Promise<{
        message: string;
    }>;
}
