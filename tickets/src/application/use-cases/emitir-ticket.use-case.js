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
var EmitirTicketUseCase_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmitirTicketUseCase = void 0;
const common_1 = require("@nestjs/common");
const uuid_1 = require("uuid");
const ticket_repository_interface_1 = require("../ports/ticket-repository.interface");
const usuarios_client_interface_1 = require("../ports/usuarios-client.interface");
const vehiculos_client_interface_1 = require("../ports/vehiculos-client.interface");
const zonas_client_interface_1 = require("../ports/zonas-client.interface");
const ticket_code_generator_interface_1 = require("../ports/ticket-code-generator.interface");
const trazabilidad_client_interface_1 = require("../ports/trazabilidad-client.interface");
const ticket_entity_1 = require("../../domain/ticket.entity");
const business_error_1 = require("../../domain/errors/business-error");
let EmitirTicketUseCase = EmitirTicketUseCase_1 = class EmitirTicketUseCase {
    constructor(ticketRepo, usuariosClient, vehiculosClient, zonasClient, codeGenerator, trazabilidadClient) {
        this.ticketRepo = ticketRepo;
        this.usuariosClient = usuariosClient;
        this.vehiculosClient = vehiculosClient;
        this.zonasClient = zonasClient;
        this.codeGenerator = codeGenerator;
        this.trazabilidadClient = trazabilidadClient;
        this.logger = new common_1.Logger(EmitirTicketUseCase_1.name);
    }
    async execute(input) {
        const { idEspacio, cedula, placa, idEmpleado, authHeader } = input;
        const resolved = await this.resolverClaveCompuesta(cedula, placa, authHeader);
        const espacio = await this.zonasClient.obtenerEspacio(idEspacio, authHeader);
        if (!espacio) {
            throw new business_error_1.BusinessError(`El espacio ${idEspacio} no existe`);
        }
        const ticketActivoEspacio = await this.ticketRepo.findActivoByEspacio(idEspacio);
        if (ticketActivoEspacio) {
            throw new business_error_1.BusinessError(`El espacio ${idEspacio} ya tiene un ticket activo`);
        }
        const ticketActivoPlaca = await this.ticketRepo.findActivoByPlaca(resolved.placa);
        if (ticketActivoPlaca) {
            throw new business_error_1.BusinessError(`La placa ${resolved.placa} ya tiene un ticket activo en otro espacio`);
        }
        const codigoTicket = this.codeGenerator.generar(idEspacio, espacio.tipo);
        const ticket = ticket_entity_1.Ticket.activo((0, uuid_1.v4)(), codigoTicket, idEspacio, resolved.cedula, resolved.placa, idEmpleado);
        let saved;
        try {
            saved = await this.ticketRepo.save(ticket);
        }
        catch (error) {
            if (error.message?.includes('duplicate key') || error.message?.includes('unique')) {
                const codigoRetry = this.codeGenerator.generar(idEspacio, espacio.tipo);
                saved = await this.ticketRepo.save(ticket_entity_1.Ticket.activo((0, uuid_1.v4)(), codigoRetry, idEspacio, resolved.cedula, resolved.placa, idEmpleado));
            }
            else {
                throw error;
            }
        }
        let retries = 3;
        while (retries > 0) {
            try {
                await this.zonasClient.marcarOcupado(idEspacio, authHeader);
                break;
            }
            catch (error) {
                retries--;
                if (retries === 0) {
                    this.logger.error(`Error crítico al marcar espacio ${idEspacio} como ocupado: ${error.message}. Inconsistencia temporal.`);
                }
                else {
                    this.logger.warn(`Fallo al marcar ocupado, reintentando... quedan ${retries} intentos`);
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            }
        }
        this.trazabilidadClient.registrarEvento({
            microservicio: 'TICKETS',
            endpoint: 'POST /tickets/emitir',
            metodoHttp: 'POST',
            tipoAccion: 'EMISION',
            descripcion: `Se emitió el ticket ${saved.codigoTicket} para placa ${saved.placa} en espacio ${idEspacio}`,
            entidadId: saved.id,
            usuarioEjecutor: idEmpleado,
            payloadNuevo: { id: saved.id, codigoTicket: saved.codigoTicket, placa: saved.placa, idEspacio },
        });
        return {
            id: saved.id,
            codigoTicket: saved.codigoTicket,
            idEspacio: saved.idEspacio,
            cedula: saved.cedula,
            placa: saved.placa,
            estado: saved.estado,
            fechaIngreso: saved.fechaIngreso,
            idEmpleado: saved.idEmpleado,
        };
    }
    async resolverClaveCompuesta(cedula, placa, authHeader) {
        if (placa) {
            const vehiculo = await this.vehiculosClient.buscarPorPlaca(placa, authHeader);
            if (!vehiculo) {
                throw new business_error_1.BusinessError(`Vehiculo con placa ${placa} no encontrado`);
            }
            const placaResuelta = vehiculo.placa || placa.trim().toUpperCase();
            if (cedula) {
                const vehiculosCedula = await this.usuariosClient.obtenerVehiculosPorCedula(cedula, authHeader);
                if (vehiculosCedula.length === 0) {
                    throw new business_error_1.BusinessError(`La cedula ${cedula} no tiene vehiculos asociados`);
                }
                const placaPerteneceACedula = vehiculosCedula.some((v) => String(v.placa ?? '').trim().toUpperCase() === placaResuelta.trim().toUpperCase());
                if (!placaPerteneceACedula) {
                    throw new business_error_1.BusinessError(`La placa ${placaResuelta} no esta asociada a la cedula ${cedula}`);
                }
                return { cedula, placa: placaResuelta };
            }
            return { cedula: vehiculo.cedulaPropietario, placa: placaResuelta };
        }
        if (cedula) {
            const vehiculos = await this.usuariosClient.obtenerVehiculosPorCedula(cedula, authHeader);
            if (vehiculos.length === 0) {
                throw new business_error_1.BusinessError(`La cédula ${cedula} no tiene vehículos asociados`);
            }
            if (vehiculos.length > 1) {
                throw new business_error_1.BusinessError(`La cédula ${cedula} tiene ${vehiculos.length} vehículos. Debe especificar la placa`);
            }
            return { cedula, placa: vehiculos[0].placa };
        }
        throw new business_error_1.BusinessError('Debe proporcionar al menos cédula o placa');
    }
};
exports.EmitirTicketUseCase = EmitirTicketUseCase;
exports.EmitirTicketUseCase = EmitirTicketUseCase = EmitirTicketUseCase_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(ticket_repository_interface_1.TICKET_REPOSITORY)),
    __param(1, (0, common_1.Inject)(usuarios_client_interface_1.USUARIOS_CLIENT)),
    __param(2, (0, common_1.Inject)(vehiculos_client_interface_1.VEHICULOS_CLIENT)),
    __param(3, (0, common_1.Inject)(zonas_client_interface_1.ZONAS_CLIENT)),
    __param(4, (0, common_1.Inject)(ticket_code_generator_interface_1.TICKET_CODE_GENERATOR)),
    __param(5, (0, common_1.Inject)(trazabilidad_client_interface_1.TRAZABILIDAD_CLIENT)),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object])
], EmitirTicketUseCase);
//# sourceMappingURL=emitir-ticket.use-case.js.map