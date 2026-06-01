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
exports.AsignacionController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const asignacion_service_1 = require("./asignacion.service");
const trazabilidad_service_1 = require("../trazabilidad/trazabilidad.service");
const create_asignacion_dto_1 = require("./dto/create-asignacion.dto");
const update_asignacion_dto_1 = require("./dto/update-asignacion.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const resource_decorator_1 = require("../opa/decorators/resource.decorator");
let AsignacionController = class AsignacionController {
    constructor(asignacionService, trazabilidadService) {
        this.asignacionService = asignacionService;
        this.trazabilidadService = trazabilidadService;
    }
    crear(dto) {
        return this.asignacionService.crear(dto);
    }
    listar() {
        return this.asignacionService.listar();
    }
    obtenerFlota(userId, authHeader) {
        return this.asignacionService.obtenerFlotaPorPropietario(userId, authHeader);
    }
    listarTrazabilidad() {
        return this.trazabilidadService.listarTodos();
    }
    listarTrazabilidadPorPropietario(userId) {
        return this.trazabilidadService.listarPorPropietario(userId);
    }
    listarTrazabilidadPorAsignacion(userId, vehicleId) {
        return this.trazabilidadService.listarPorAsignacion(userId, vehicleId);
    }
    buscarPorClave(userId, vehicleId) {
        return this.asignacionService.buscarPorClave(userId, vehicleId);
    }
    actualizar(userId, vehicleId, dto) {
        return this.asignacionService.actualizar(userId, vehicleId, dto);
    }
    eliminar(userId, vehicleId) {
        return this.asignacionService.eliminar(userId, vehicleId);
    }
};
exports.AsignacionController = AsignacionController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, resource_decorator_1.Resource)('asignaciones.create'),
    (0, swagger_1.ApiOperation)({
        summary: 'RF1 - Crear asignación vehículo-propietario',
        description: 'Asocia un vehículo a un propietario usando clave compuesta (userId + vehicleId). ' +
            'Un vehículo solo puede tener una asignación activa a la vez. ' +
            'Genera automáticamente un evento de trazabilidad CREACION.',
    }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Asignación creada exitosamente' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'UUID inválido o datos incorrectos' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'El vehículo ya está asignado activamente' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_asignacion_dto_1.CreateAsignacionDto]),
    __metadata("design:returntype", void 0)
], AsignacionController.prototype, "crear", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, resource_decorator_1.Resource)('asignaciones.read'),
    (0, swagger_1.ApiOperation)({ summary: 'Listar todas las asignaciones' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Lista de asignaciones' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AsignacionController.prototype, "listar", null);
__decorate([
    (0, common_1.Get)('propietario/:userId'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, resource_decorator_1.Resource)('asignaciones.read'),
    (0, swagger_1.ApiOperation)({
        summary: 'RF3 - Obtener flota de vehículos de un propietario',
        description: 'Retorna la lista de vehículos asignados al propietario, ' +
            'enriquecida con tipo y categoría obtenidos del Microservicio de Vehículos.',
    }),
    (0, swagger_1.ApiParam)({ name: 'userId', description: 'UUID del propietario', example: 'a3f1b2c4-1234-4abc-89de-1234567890ab' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Lista de vehículos asignados con tipo y categoría' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'UUID inválido' }),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Headers)('authorization')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], AsignacionController.prototype, "obtenerFlota", null);
__decorate([
    (0, swagger_1.ApiTags)('Trazabilidad'),
    (0, common_1.Get)('trazabilidad/historial'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, resource_decorator_1.Resource)('trazabilidad.read'),
    (0, swagger_1.ApiOperation)({
        summary: 'RF2 - Obtener historial completo de auditoría (enriquecido)',
        description: 'Retorna todos los eventos de auditoría con información amigable ' +
            '(nombres de usuario, datos de vehículos). Endpoint principal: GET /trazabilidad/historial',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Todos los eventos de auditoría enriquecidos' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AsignacionController.prototype, "listarTrazabilidad", null);
__decorate([
    (0, swagger_1.ApiTags)('Trazabilidad'),
    (0, common_1.Get)('trazabilidad/propietario/:userId'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, resource_decorator_1.Resource)('trazabilidad.read'),
    (0, swagger_1.ApiOperation)({
        summary: 'RF2 - Historial de auditoría de un propietario (enriquecido)',
        description: 'Retorna eventos de un propietario con datos legibles.',
    }),
    (0, swagger_1.ApiParam)({ name: 'userId', description: 'UUID del propietario' }),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AsignacionController.prototype, "listarTrazabilidadPorPropietario", null);
__decorate([
    (0, swagger_1.ApiTags)('Trazabilidad'),
    (0, common_1.Get)('trazabilidad/:userId/:vehicleId'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, resource_decorator_1.Resource)('trazabilidad.read'),
    (0, swagger_1.ApiOperation)({
        summary: 'RF2 - Historial de auditoría de una asignación específica (enriquecido)',
        description: 'Retorna eventos de una asignación con datos legibles.',
    }),
    (0, swagger_1.ApiParam)({ name: 'userId', description: 'UUID del propietario' }),
    (0, swagger_1.ApiParam)({ name: 'vehicleId', description: 'UUID del vehículo' }),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Param)('vehicleId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], AsignacionController.prototype, "listarTrazabilidadPorAsignacion", null);
__decorate([
    (0, common_1.Get)(':userId/:vehicleId'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, resource_decorator_1.Resource)('asignaciones.read'),
    (0, swagger_1.ApiOperation)({ summary: 'RF1 - Buscar asignación por clave compuesta (userId + vehicleId)' }),
    (0, swagger_1.ApiParam)({ name: 'userId', description: 'UUID del propietario', example: 'a3f1b2c4-1234-4abc-89de-1234567890ab' }),
    (0, swagger_1.ApiParam)({ name: 'vehicleId', description: 'UUID del vehículo', example: 'b4e2c3d5-5678-4def-90ef-234567890bcd' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Asignación encontrada' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Asignación no encontrada' }),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Param)('vehicleId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], AsignacionController.prototype, "buscarPorClave", null);
__decorate([
    (0, common_1.Put)(':userId/:vehicleId'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, resource_decorator_1.Resource)('asignaciones.update'),
    (0, swagger_1.ApiOperation)({
        summary: 'RF1 - Actualizar asignación (estado/notas)',
        description: 'Actualiza el estado o notas de una asignación. ' +
            'Genera automáticamente un evento de trazabilidad MODIFICACION.',
    }),
    (0, swagger_1.ApiParam)({ name: 'userId', description: 'UUID del propietario' }),
    (0, swagger_1.ApiParam)({ name: 'vehicleId', description: 'UUID del vehículo' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Asignación actualizada' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Sin cambios detectados o datos inválidos' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Asignación no encontrada' }),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Param)('vehicleId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, update_asignacion_dto_1.UpdateAsignacionDto]),
    __metadata("design:returntype", void 0)
], AsignacionController.prototype, "actualizar", null);
__decorate([
    (0, common_1.Delete)(':userId/:vehicleId'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, resource_decorator_1.Resource)('asignaciones.delete'),
    (0, swagger_1.ApiOperation)({
        summary: 'RF1 - Eliminar asignación',
        description: 'Elimina una asignación por su clave compuesta. ' +
            'Genera automáticamente un evento de trazabilidad ELIMINACION.',
    }),
    (0, swagger_1.ApiParam)({ name: 'userId', description: 'UUID del propietario' }),
    (0, swagger_1.ApiParam)({ name: 'vehicleId', description: 'UUID del vehículo' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Asignación eliminada' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Asignación no encontrada' }),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Param)('vehicleId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], AsignacionController.prototype, "eliminar", null);
exports.AsignacionController = AsignacionController = __decorate([
    (0, swagger_1.ApiTags)('Asignaciones'),
    (0, common_1.Controller)('asignaciones'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [asignacion_service_1.AsignacionService,
        trazabilidad_service_1.TrazabilidadService])
], AsignacionController);
//# sourceMappingURL=asignacion.controller.js.map