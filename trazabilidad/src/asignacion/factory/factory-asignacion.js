"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FactoryAsignacion = void 0;
const asignacion_entity_1 = require("../entities/asignacion.entity");
class FactoryAsignacion {
    static crear(dto) {
        const asignacion = new asignacion_entity_1.Asignacion();
        asignacion.userId = dto.userId.trim().toLowerCase();
        asignacion.vehicleId = dto.vehicleId.trim().toLowerCase();
        asignacion.descripcion = dto.descripcion?.trim() ?? null;
        asignacion.estado = 1;
        return asignacion;
    }
}
exports.FactoryAsignacion = FactoryAsignacion;
//# sourceMappingURL=factory-asignacion.js.map