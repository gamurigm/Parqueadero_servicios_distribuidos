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
var TrazabilidadClientService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrazabilidadClientService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const config_1 = require("@nestjs/config");
const rxjs_1 = require("rxjs");
let TrazabilidadClientService = TrazabilidadClientService_1 = class TrazabilidadClientService {
    constructor(httpService, configService) {
        this.httpService = httpService;
        this.configService = configService;
        this.logger = new common_1.Logger(TrazabilidadClientService_1.name);
        this.trazabilidadUrl = this.configService.get('TRAZABILIDAD_SERVICE_URL', 'http://trazabilidad:3002');
    }
    async registrarEvento(dto) {
        try {
            const url = `${this.trazabilidadUrl}/trazabilidad/registrar`;
            await (0, rxjs_1.firstValueFrom)(this.httpService.post(url, dto));
        }
        catch (error) {
            this.logger.error(`Error enviando evento de trazabilidad a ${this.trazabilidadUrl}: ${error.message}`);
        }
    }
};
exports.TrazabilidadClientService = TrazabilidadClientService;
exports.TrazabilidadClientService = TrazabilidadClientService = TrazabilidadClientService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService,
        config_1.ConfigService])
], TrazabilidadClientService);
//# sourceMappingURL=trazabilidad-client.service.js.map