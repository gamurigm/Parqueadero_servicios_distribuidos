"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrazabilidadModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const trazabilidad_entity_1 = require("./entities/trazabilidad.entity");
const trazabilidad_service_1 = require("./trazabilidad.service");
const trazabilidad_controller_1 = require("./trazabilidad.controller");
const vehiculos_client_module_1 = require("../vehiculos-client/vehiculos-client.module");
const usuarios_client_module_1 = require("../usuarios-client/usuarios-client.module");
let TrazabilidadModule = class TrazabilidadModule {
};
exports.TrazabilidadModule = TrazabilidadModule;
exports.TrazabilidadModule = TrazabilidadModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([trazabilidad_entity_1.EventoTrazabilidad]),
            vehiculos_client_module_1.VehiculosClientModule,
            usuarios_client_module_1.UsuariosClientModule,
        ],
        controllers: [trazabilidad_controller_1.TrazabilidadController],
        providers: [trazabilidad_service_1.TrazabilidadService],
        exports: [trazabilidad_service_1.TrazabilidadService],
    })
], TrazabilidadModule);
//# sourceMappingURL=trazabilidad.module.js.map