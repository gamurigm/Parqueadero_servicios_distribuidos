"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TicketsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const emitir_ticket_use_case_1 = require("../../application/use-cases/emitir-ticket.use-case");
const pagar_ticket_use_case_1 = require("../../application/use-cases/pagar-ticket.use-case");
const anular_ticket_use_case_1 = require("../../application/use-cases/anular-ticket.use-case");
const ticket_repository_interface_1 = require("../../application/ports/ticket-repository.interface");
const emitir_ticket_request_dto_1 = require("../dto/request/emitir-ticket-request.dto");
const pagar_ticket_request_dto_1 = require("../dto/request/pagar-ticket-request.dto");
const anular_ticket_request_dto_1 = require("../dto/request/anular-ticket-request.dto");
const ticket_response_dto_1 = require("../dto/response/ticket-response.dto");
const pago_response_dto_1 = require("../dto/response/pago-response.dto");
const resource_decorator_1 = require("../../opa/decorators/resource.decorator");
let TicketsController = class TicketsController {
    constructor(emitirUseCase, pagarUseCase, anularUseCase, ticketRepo) {
        this.emitirUseCase = emitirUseCase;
        this.pagarUseCase = pagarUseCase;
        this.anularUseCase = anularUseCase;
        this.ticketRepo = ticketRepo;
    }
    async emitir(dto, req) {
        const result = await this.emitirUseCase.execute({
            idEspacio: dto.idEspacio,
            cedula: dto.cedula,
            placa: dto.placa,
            idEmpleado: req.user.id,
            authHeader: req.headers.authorization,
        });
        return result;
    }
    async pagar(dto, req) {
        return await this.pagarUseCase.execute({
            idTicket: dto.idTicket,
            codigoTicket: dto.codigoTicket,
            idEmpleado: req.user.id,
            authHeader: req.headers.authorization,
        });
    }
    async anular(dto, req) {
        const result = await this.anularUseCase.execute({
            idTicket: dto.idTicket,
            codigoTicket: dto.codigoTicket,
            idEmpleado: req.user.id,
            motivo: dto.motivo,
        });
        return result;
    }
    async listarTodos() {
        const tickets = await this.ticketRepo.findAll();
        return tickets;
    }
    async obtenerPorCodigo(codigo) {
        const ticket = await this.ticketRepo.findByCodigo(codigo);
        if (!ticket) {
            throw new common_1.NotFoundException('Ticket no encontrado');
        }
        return ticket;
    }
    async obtener(id) {
        const ticket = await this.ticketRepo.findById(id);
        if (!ticket) {
            throw new common_1.NotFoundException('Ticket no encontrado');
        }
        return ticket;
    }
};
exports.TicketsController = TicketsController;
__decorate([
    (0, common_1.Post)('emitir'),
    (0, resource_decorator_1.Resource)('tickets.emitir'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Emitir un nuevo ticket de parqueo' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Ticket emitido exitosamente', type: ticket_response_dto_1.TicketResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Error de validación o regla de negocio' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [emitir_ticket_request_dto_1.EmitirTicketRequestDto, Object]),
    __metadata("design:returntype", Promise)
], TicketsController.prototype, "emitir", null);
__decorate([
    (0, common_1.Post)('pagar'),
    (0, resource_decorator_1.Resource)('tickets.pagar'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Pagar un ticket de parqueo' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Ticket pagado exitosamente', type: pago_response_dto_1.PagoResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Error de validación o regla de negocio' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Ticket no encontrado' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pagar_ticket_request_dto_1.PagarTicketRequestDto, Object]),
    __metadata("design:returntype", Promise)
], TicketsController.prototype, "pagar", null);
__decorate([
    (0, common_1.Post)('anular'),
    (0, resource_decorator_1.Resource)('tickets.anular'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Anular un ticket de parqueo' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Ticket anulado exitosamente', type: ticket_response_dto_1.TicketResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Error de validación o regla de negocio' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [anular_ticket_request_dto_1.AnularTicketRequestDto, Object]),
    __metadata("design:returntype", Promise)
], TicketsController.prototype, "anular", null);
__decorate([
    (0, common_1.Get)(),
    (0, resource_decorator_1.Resource)('tickets.read'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Listar todos los tickets' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Lista de tickets', type: ticket_response_dto_1.TicketResponseDto, isArray: true }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TicketsController.prototype, "listarTodos", null);
__decorate([
    (0, common_1.Get)('codigo/:codigo'),
    (0, resource_decorator_1.Resource)('tickets.read'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener un ticket por codigo unico' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Ticket encontrado', type: ticket_response_dto_1.TicketResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Ticket no encontrado' }),
    __param(0, (0, common_1.Param)('codigo')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TicketsController.prototype, "obtenerPorCodigo", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, resource_decorator_1.Resource)('tickets.read'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener un ticket por ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Ticket encontrado', type: ticket_response_dto_1.TicketResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Ticket no encontrado' }),
    __param(0, (0, common_1.Param)('id', new common_1.ParseUUIDPipe({ version: '4' }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TicketsController.prototype, "obtener", null);
exports.TicketsController = TicketsController = __decorate([
    (0, swagger_1.ApiTags)('Tickets'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)(),
    __param(3, (0, common_1.Inject)(ticket_repository_interface_1.TICKET_REPOSITORY)),
    __metadata("design:paramtypes", [emitir_ticket_use_case_1.EmitirTicketUseCase,
        pagar_ticket_use_case_1.PagarTicketUseCase,
        anular_ticket_use_case_1.AnularTicketUseCase, Object])
], TicketsController);
//# sourceMappingURL=tickets.controller.js.map