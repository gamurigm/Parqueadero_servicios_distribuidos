import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  HttpCode,
  HttpStatus,
  Inject,
  NotFoundException,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { EmitirTicketUseCase } from '../../application/use-cases/emitir-ticket.use-case';
import { PagarTicketUseCase } from '../../application/use-cases/pagar-ticket.use-case';
import { AnularTicketUseCase } from '../../application/use-cases/anular-ticket.use-case';
import {
  ITicketRepository,
  TICKET_REPOSITORY,
} from '../../application/ports/ticket-repository.interface';
import { EmitirTicketRequestDto } from '../dto/request/emitir-ticket-request.dto';
import { PagarTicketRequestDto } from '../dto/request/pagar-ticket-request.dto';
import { AnularTicketRequestDto } from '../dto/request/anular-ticket-request.dto';
import { TicketResponseDto } from '../dto/response/ticket-response.dto';
import { PagoResponseDto } from '../dto/response/pago-response.dto';
import { Resource } from '../../opa/decorators/resource.decorator';

@ApiTags('Tickets')
@ApiBearerAuth()
@Controller()
export class TicketsController {
  constructor(
    private readonly emitirUseCase: EmitirTicketUseCase,
    private readonly pagarUseCase: PagarTicketUseCase,
    private readonly anularUseCase: AnularTicketUseCase,
    @Inject(TICKET_REPOSITORY)
    private readonly ticketRepo: ITicketRepository,
  ) {}

  @Post('emitir')
  @Resource('tickets.emitir')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Emitir un nuevo ticket de parqueo' })
  @ApiResponse({ status: 201, description: 'Ticket emitido exitosamente', type: TicketResponseDto })
  @ApiResponse({ status: 400, description: 'Error de validación o regla de negocio' })
  async emitir(@Body() dto: EmitirTicketRequestDto, @Req() req: any): Promise<TicketResponseDto> {
    const result = await this.emitirUseCase.execute({
      idEspacio: dto.idEspacio.trim(),
      cedula: dto.cedula?.trim(),
      placa: dto.placa?.trim(),
      idEmpleado: req.user.id,
    });
    return result as TicketResponseDto;
  }

  @Post('pagar')
  @Resource('tickets.pagar')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Pagar un ticket de parqueo' })
  @ApiResponse({ status: 200, description: 'Ticket pagado exitosamente', type: PagoResponseDto })
  @ApiResponse({ status: 400, description: 'Error de validación o regla de negocio' })
  @ApiResponse({ status: 404, description: 'Ticket no encontrado' })
  async pagar(@Body() dto: PagarTicketRequestDto, @Req() req: any): Promise<PagoResponseDto> {
    return await this.pagarUseCase.execute({
      idTicket: dto.idTicket?.trim(),
      codigoTicket: dto.codigoTicket?.trim(),
      idEmpleado: req.user.id,
    });
  }

  @Post('anular')
  @Resource('tickets.anular')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Anular un ticket de parqueo' })
  @ApiResponse({ status: 200, description: 'Ticket anulado exitosamente', type: TicketResponseDto })
  @ApiResponse({ status: 400, description: 'Error de validación o regla de negocio' })
  async anular(@Body() dto: AnularTicketRequestDto, @Req() req: any): Promise<TicketResponseDto> {
    const result = await this.anularUseCase.execute({
      idTicket: dto.idTicket?.trim(),
      codigoTicket: dto.codigoTicket?.trim(),
      idEmpleado: req.user.id,
      motivo: dto.motivo.trim(),
    });
    return result as TicketResponseDto;
  }

  @Get(':id')
  @Resource('tickets.read')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener un ticket por ID' })
  @ApiResponse({ status: 200, description: 'Ticket encontrado', type: TicketResponseDto })
  @ApiResponse({ status: 404, description: 'Ticket no encontrado' })
  async obtener(@Param('id') id: string): Promise<TicketResponseDto> {
    const ticket = await this.ticketRepo.findById(id);
    if (!ticket) {
      throw new NotFoundException('Ticket no encontrado');
    }
    return ticket as unknown as TicketResponseDto;
  }

  @Get('codigo/:codigo')
  @Resource('tickets.read')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener un ticket por código único' })
  @ApiResponse({ status: 200, description: 'Ticket encontrado', type: TicketResponseDto })
  @ApiResponse({ status: 404, description: 'Ticket no encontrado' })
  async obtenerPorCodigo(@Param('codigo') codigo: string): Promise<TicketResponseDto> {
    const ticket = await this.ticketRepo.findByCodigo(codigo);
    if (!ticket) {
      throw new NotFoundException('Ticket no encontrado');
    }
    return ticket as unknown as TicketResponseDto;
  }
}
