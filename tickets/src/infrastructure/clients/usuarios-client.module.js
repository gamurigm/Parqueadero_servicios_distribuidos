"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsuariosClientModule = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const config_1 = require("@nestjs/config");
const usuarios_client_service_1 = require("./usuarios-client.service");
let UsuariosClientModule = class UsuariosClientModule {
};
exports.UsuariosClientModule = UsuariosClientModule;
exports.UsuariosClientModule = UsuariosClientModule = __decorate([
    (0, common_1.Module)({
        imports: [
            axios_1.HttpModule.registerAsync({
                imports: [config_1.ConfigModule],
                useFactory: (configService) => ({
                    baseURL: configService.get('USUARIOS_SERVICE_URL', 'http://localhost:5000'),
                    timeout: 5000,
                    maxRedirects: 5,
                }),
                inject: [config_1.ConfigService],
            }),
        ],
        providers: [usuarios_client_service_1.UsuariosClientService],
        exports: [usuarios_client_service_1.UsuariosClientService],
    })
], UsuariosClientModule);
//# sourceMappingURL=usuarios-client.module.js.map