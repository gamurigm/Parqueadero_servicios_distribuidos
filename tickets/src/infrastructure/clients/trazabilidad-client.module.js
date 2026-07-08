"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrazabilidadClientModule = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const config_1 = require("@nestjs/config");
const trazabilidad_client_service_1 = require("./trazabilidad-client.service");
const trazabilidad_client_interface_1 = require("../../application/ports/trazabilidad-client.interface");
let TrazabilidadClientModule = class TrazabilidadClientModule {
};
exports.TrazabilidadClientModule = TrazabilidadClientModule;
exports.TrazabilidadClientModule = TrazabilidadClientModule = __decorate([
    (0, common_1.Module)({
        imports: [
            axios_1.HttpModule.register({
                timeout: 5000,
                maxRedirects: 5,
            }),
            config_1.ConfigModule,
        ],
        providers: [
            {
                provide: trazabilidad_client_interface_1.TRAZABILIDAD_CLIENT,
                useClass: trazabilidad_client_service_1.TrazabilidadClientService,
            },
        ],
        exports: [trazabilidad_client_interface_1.TRAZABILIDAD_CLIENT],
    })
], TrazabilidadClientModule);
//# sourceMappingURL=trazabilidad-client.module.js.map