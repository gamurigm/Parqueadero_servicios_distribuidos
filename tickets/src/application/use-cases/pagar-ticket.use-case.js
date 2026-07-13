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
var PagarTicketUseCase_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PagarTicketUseCase = void 0;
const common_1 = require("@nestjs/common");
const ticket_repository_interface_1 = require("../ports/ticket-repository.interface");
const zonas_client_interface_1 = require("../ports/zonas-client.interface");
const tarifa_provider_interface_1 = require("../ports/tarifa-provider.interface");
const vehiculos_client_interface_1 = require("../ports/vehiculos-client.interface");
const trazabilidad_client_interface_1 = require("../ports/trazabilidad-client.interface");
const business_error_1 = require("../../domain/errors/business-error");
let PagarTicketUseCase = PagarTicketUseCase_1 = class PagarTicketUseCase {
    constructor(ticketRepo, zonasClient, tarifaProvider, vehiculosClient, trazabilidadClient) {
        this.ticketRepo = ticketRepo;
        this.zonasClient = zonasClient;
        this.tarifaProvider = tarifaProvider;
        this.vehiculosClient = vehiculosClient;
        this.trazabilidadClient = trazabilidadClient;
        this.logger = new common_1.Logger(PagarTicketUseCase_1.name);
    }
    async execute(input) {
        const ticket = input.idTicket
            ? await this.ticketRepo.findById(input.idTicket)
            : await this.ticketRepo.findByCodigo(input.codigoTicket);
        if (!ticket) {
            throw new business_error_1.BusinessError('Ticket no encontrado');
        }
        if (ticket.estado !== 'ACTIVO') {
            throw new business_error_1.BusinessError(`No se puede pagar un ticket en estado ${ticket.estado}`);
        }
        const fechaSalida = new Date();
        const diffMs = fechaSalida.getTime() - ticket.fechaIngreso.getTime();
        const diffHoras = Math.ceil(diffMs / (1000 * 60 * 60));
        const horasCobradas = Math.max(diffHoras, 1);
        const vehiculo = await this.vehiculosClient.buscarPorPlaca(ticket.placa, input.authHeader);
        const tipoVehiculo = vehiculo?.tipo || 'Automóvil';
        const espacio = await this.zonasClient.obtenerEspacio(ticket.idEspacio, input.authHeader);
        const tipoEspacio = espacio?.tipo || 'regular';
        const tarifaPorHora = this.tarifaProvider.obtenerTarifaPorHora(tipoVehiculo, tipoEspacio);
        const valor = parseFloat((horasCobradas * tarifaPorHora).toFixed(2));
        ticket.pagar(fechaSalida, valor, input.idEmpleado);
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
                    this.logger.error(`Error crítico al liberar espacio ${ticket.idEspacio} tras pago: ${error.message}. Inconsistencia temporal.`);
                }
                else {
                    this.logger.warn(`Fallo al marcar libre, reintentando... quedan ${retries} intentos`);
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            }
        }
        this.trazabilidadClient.registrarEvento({
            microservicio: 'TICKETS',
            endpoint: 'POST /tickets/pagar',
            metodoHttp: 'POST',
            tipoAccion: 'PAGO',
            descripcion: `Se pagó el ticket ${updated.codigoTicket} por valor de $${valor}`,
            entidadId: updated.id,
            usuarioEjecutor: input.idEmpleado,
            payloadAnterior: { estado: 'ACTIVO' },
            payloadNuevo: { estado: 'PAGADO', valorRecaudado: valor, fechaSalida },
        });
        return {
            id: updated.id,
            codigoTicket: updated.codigoTicket,
            estado: 'PAGADO',
            fechaIngreso: updated.fechaIngreso,
            fechaSalida: updated.fechaSalida,
            valorRecaudado: updated.valorRecaudado,
            horasCobradas,
            tarifaPorHora,
        };
    }
};
exports.PagarTicketUseCase = PagarTicketUseCase;
exports.PagarTicketUseCase = PagarTicketUseCase = PagarTicketUseCase_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(ticket_repository_interface_1.TICKET_REPOSITORY)),
    __param(1, (0, common_1.Inject)(zonas_client_interface_1.ZONAS_CLIENT)),
    __param(2, (0, common_1.Inject)(tarifa_provider_interface_1.TARIFA_PROVIDER)),
    __param(3, (0, common_1.Inject)(vehiculos_client_interface_1.VEHICULOS_CLIENT)),
    __param(4, (0, common_1.Inject)(trazabilidad_client_interface_1.TRAZABILIDAD_CLIENT)),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object])
], PagarTicketUseCase);
//# sourceMappingURL=pagar-ticket.use-case.js.map