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
exports.TrazabilidadController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const trazabilidad_service_1 = require("./trazabilidad.service");
const registrar_evento_dto_1 = require("./dto/registrar-evento.dto");
const trazabilidad_entity_1 = require("./entities/trazabilidad.entity");
let TrazabilidadController = class TrazabilidadController {
    constructor(trazabilidadService) {
        this.trazabilidadService = trazabilidadService;
    }
    async registrarEvento(dto) {
        return this.trazabilidadService.registrarEvento(dto);
    }
    async listarTodos(authHeader) {
        console.log('--- AUTH HEADER RECEIVED IN TRAZABILIDAD ---', authHeader);
        return this.trazabilidadService.listarTodos(authHeader);
    }
    async listarPorMicroservicio(nombre, authHeader) {
        const microservicioUpper = nombre.toUpperCase();
        if (!Object.values(trazabilidad_entity_1.Microservicio).includes(microservicioUpper)) {
            throw new common_1.BadRequestException(`Microservicio inválido: "${nombre}". Valores válidos: ${Object.values(trazabilidad_entity_1.Microservicio).join(', ')}`);
        }
        return this.trazabilidadService.listarPorMicroservicio(microservicioUpper, authHeader);
    }
    async listarPorPropietario(userId, authHeader) {
        return this.trazabilidadService.listarPorPropietario(userId, authHeader);
    }
    async listarPorAsignacion(userId, vehicleId, authHeader) {
        return this.trazabilidadService.listarPorAsignacion(userId, vehicleId, authHeader);
    }
};
exports.TrazabilidadController = TrazabilidadController;
__decorate([
    (0, common_1.Post)('registrar'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({
        summary: 'Registrar evento de trazabilidad desde cualquier microservicio',
        description: 'Endpoint receptor para que cualquier microservicio (Usuarios, Vehículos, Zonas, Tickets) ' +
            'pueda registrar un evento de auditoría. Recibe información del microservicio de origen, ' +
            'endpoint, acción, descripción legible y payloads opcionales.',
    }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Evento de trazabilidad registrado exitosamente' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Datos inválidos' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [registrar_evento_dto_1.RegistrarEventoDto]),
    __metadata("design:returntype", Promise)
], TrazabilidadController.prototype, "registrarEvento", null);
__decorate([
    (0, common_1.Get)('historial'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({
        summary: 'Obtener historial completo de auditoría (todos los microservicios)',
        description: 'Retorna todos los eventos de trazabilidad del sistema, ' +
            'enriquecidos con datos legibles (nombres de usuario, placas de vehículo).',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Historial completo de auditoría enriquecido' }),
    __param(0, (0, common_1.Headers)('authorization')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TrazabilidadController.prototype, "listarTodos", null);
__decorate([
    (0, common_1.Get)('microservicio/:nombre'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({
        summary: 'Filtrar trazabilidad por microservicio',
        description: 'Retorna eventos de un microservicio específico (USUARIOS, VEHICULOS, ZONAS, TICKETS, TRAZABILIDAD).',
    }),
    (0, swagger_1.ApiParam)({
        name: 'nombre',
        description: 'Nombre del microservicio',
        enum: trazabilidad_entity_1.Microservicio,
        example: 'VEHICULOS',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Eventos filtrados por microservicio' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Nombre de microservicio inválido' }),
    __param(0, (0, common_1.Param)('nombre')),
    __param(1, (0, common_1.Headers)('authorization')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], TrazabilidadController.prototype, "listarPorMicroservicio", null);
__decorate([
    (0, common_1.Get)('propietario/:userId'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({
        summary: 'Historial de auditoría de un propietario',
        description: 'Retorna todos los eventos de trazabilidad asociados a un propietario, ' +
            'enriquecidos con datos legibles.',
    }),
    (0, swagger_1.ApiParam)({ name: 'userId', description: 'UUID del propietario' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Eventos de trazabilidad del propietario' }),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Headers)('authorization')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], TrazabilidadController.prototype, "listarPorPropietario", null);
__decorate([
    (0, common_1.Get)(':userId/:vehicleId'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({
        summary: 'Historial de auditoría de una asignación específica',
        description: 'Retorna los eventos de trazabilidad de una asignación (userId + vehicleId), ' +
            'enriquecidos con datos legibles.',
    }),
    (0, swagger_1.ApiParam)({ name: 'userId', description: 'UUID del propietario' }),
    (0, swagger_1.ApiParam)({ name: 'vehicleId', description: 'UUID del vehículo' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Eventos de trazabilidad de la asignación' }),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Param)('vehicleId')),
    __param(2, (0, common_1.Headers)('authorization')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], TrazabilidadController.prototype, "listarPorAsignacion", null);
exports.TrazabilidadController = TrazabilidadController = __decorate([
    (0, swagger_1.ApiTags)('Trazabilidad'),
    (0, common_1.Controller)('trazabilidad'),
    __metadata("design:paramtypes", [trazabilidad_service_1.TrazabilidadService])
], TrazabilidadController);
//# sourceMappingURL=trazabilidad.controller.js.map