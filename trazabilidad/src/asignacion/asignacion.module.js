"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AsignacionModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const asignacion_entity_1 = require("./entities/asignacion.entity");
const asignacion_service_1 = require("./asignacion.service");
const asignacion_controller_1 = require("./asignacion.controller");
const trazabilidad_module_1 = require("../trazabilidad/trazabilidad.module");
const vehiculos_client_module_1 = require("../vehiculos-client/vehiculos-client.module");
const usuarios_client_module_1 = require("../usuarios-client/usuarios-client.module");
let AsignacionModule = class AsignacionModule {
};
exports.AsignacionModule = AsignacionModule;
exports.AsignacionModule = AsignacionModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([asignacion_entity_1.Asignacion]),
            trazabilidad_module_1.TrazabilidadModule,
            vehiculos_client_module_1.VehiculosClientModule,
            usuarios_client_module_1.UsuariosClientModule,
        ],
        controllers: [asignacion_controller_1.AsignacionController],
        providers: [asignacion_service_1.AsignacionService],
    })
], AsignacionModule);
//# sourceMappingURL=asignacion.module.js.map