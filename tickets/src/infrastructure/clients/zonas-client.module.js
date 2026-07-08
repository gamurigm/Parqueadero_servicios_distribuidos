"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZonasClientModule = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const config_1 = require("@nestjs/config");
const zonas_client_service_1 = require("./zonas-client.service");
let ZonasClientModule = class ZonasClientModule {
};
exports.ZonasClientModule = ZonasClientModule;
exports.ZonasClientModule = ZonasClientModule = __decorate([
    (0, common_1.Module)({
        imports: [
            axios_1.HttpModule.registerAsync({
                imports: [config_1.ConfigModule],
                useFactory: (configService) => ({
                    baseURL: configService.get('ZONAS_SERVICE_URL', 'http://localhost:8080'),
                    timeout: 5000,
                    maxRedirects: 5,
                }),
                inject: [config_1.ConfigService],
            }),
        ],
        providers: [zonas_client_service_1.ZonasClientService],
        exports: [zonas_client_service_1.ZonasClientService],
    })
], ZonasClientModule);
//# sourceMappingURL=zonas-client.module.js.map