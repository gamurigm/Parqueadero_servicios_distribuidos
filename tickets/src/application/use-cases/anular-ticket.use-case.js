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
var AnularTicketUseCase_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnularTicketUseCase = void 0;
const common_1 = require("@nestjs/common");
const ticket_repository_interface_1 = require("../ports/ticket-repository.interface");
const zonas_client_interface_1 = require("../ports/zonas-client.interface");
const trazabilidad_client_interface_1 = require("../ports/trazabilidad-client.interface");
const business_error_1 = require("../../domain/errors/business-error");
const event_publisher_service_1 = require("../../event-publisher.service");
const sse_service_1 = require("../../sse/sse.service");
let AnularTicketUseCase = AnularTicketUseCase_1 = class AnularTicketUseCase {
    constructor(ticketRepo, zonasClient, trazabilidadClient, eventPublisher, sseService) {
        this.ticketRepo = ticketRepo;
        this.zonasClient = zonasClient;
        this.trazabilidadClient = trazabilidadClient;
        this.eventPublisher = eventPublisher;
        this.sseService = sseService;
        this.logger = new common_1.Logger(AnularTicketUseCase_1.name);
    }
    async execute(input) {
        const ticket = input.idTicket
            ? await this.ticketRepo.findById(input.idTicket)
            : await this.ticketRepo.findByCodigo(input.codigoTicket);
        if (!ticket) {
            throw new business_error_1.BusinessError('Ticket no encontrado');
        }
        ticket.anular(input.motivo, input.idEmpleado);
        const updated = await this.ticketRepo.update(ticket);
        let retries = 3;
        while (retries > 0) {
            try {
                await this.zonasClient.marcarLibre(ticket.idEspacio, input.authHeader);
                break;
            }
            catch (error) {
                retries--;
                if (retries === 0) {
                    this.logger.error(`Error crítico al liberar espacio ${ticket.idEspacio} tras anulación: ${error.message}. Inconsistencia temporal.`);
                }
                else {
                    this.logger.warn(`Fallo al marcar libre, reintentando... quedan ${retries} intentos`);
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            }
        }
        this.trazabilidadClient.registrarEvento({
            microservicio: 'TICKETS',
            endpoint: 'POST /tickets/anular',
            metodoHttp: 'POST',
            tipoAccion: 'ANULACION',
            descripcion: `Se anuló el ticket ${updated.codigoTicket}. Motivo: ${input.motivo}`,
            entidadId: updated.id,
            usuarioEjecutor: input.idEmpleado,
            payloadAnterior: { estado: 'ACTIVO' },
            payloadNuevo: { estado: 'ANULADO', motivo: input.motivo },
        }, input.authHeader);
        const auditEvent = {
            servicio: 'ms-tickets',
            accion: 'UPDATE',
            entidad: 'TICKET',
            usuario: input.username || 'system',
            ip: input.ip,
            mac: input.mac,
            datos: { id: updated.id, codigoTicket: updated.codigoTicket, estado: 'ANULADO', motivo: input.motivo },
        };
        await this.eventPublisher.publish(auditEvent);
        await this.sseService.emitEvent('espacio-actualizado', {
            id: ticket.idEspacio,
            estado: 'DISPONIBLE',
        });
        return {
            id: updated.id,
            codigoTicket: updated.codigoTicket,
            estado: 'ANULADO',
            motivoAnulacion: input.motivo,
        };
    }
};
exports.AnularTicketUseCase = AnularTicketUseCase;
exports.AnularTicketUseCase = AnularTicketUseCase = AnularTicketUseCase_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(ticket_repository_interface_1.TICKET_REPOSITORY)),
    __param(1, (0, common_1.Inject)(zonas_client_interface_1.ZONAS_CLIENT)),
    __param(2, (0, common_1.Inject)(trazabilidad_client_interface_1.TRAZABILIDAD_CLIENT)),
    __metadata("design:paramtypes", [Object, Object, Object, event_publisher_service_1.EventPublisher,
        sse_service_1.SseService])
], AnularTicketUseCase);
//# sourceMappingURL=anular-ticket.use-case.js.map