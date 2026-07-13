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
var ZonasClientService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZonasClientService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const config_1 = require("@nestjs/config");
const rxjs_1 = require("rxjs");
let ZonasClientService = ZonasClientService_1 = class ZonasClientService {
    constructor(httpService, configService) {
        this.httpService = httpService;
        this.configService = configService;
        this.logger = new common_1.Logger(ZonasClientService_1.name);
        const configuredUrl = this.configService.get('ZONAS_SERVICE_URL', 'http://localhost:8080');
        this.baseUrl = configuredUrl.replace(/\/$/, '');
    }
    async obtenerEspacio(idEspacio, authHeader) {
        const headers = authHeader ? { Authorization: authHeader } : undefined;
        try {
            const url = `${this.apiBase}/espacios/`;
            this.logger.log(`Consultando espacios: ${url}`);
            const res = await (0, rxjs_1.firstValueFrom)(this.httpService.get(url, { headers }));
            const espacios = Array.isArray(res.data) ? res.data : [];
            const data = espacios.find((e) => String(e.id) === idEspacio || String(e.codigo) === idEspacio);
            if (!data) {
                this.logger.warn(`Espacio ${idEspacio} no encontrado`);
                return null;
            }
            return this.mapEspacio(data, idEspacio);
        }
        catch (error) {
            this.logger.error(`Error al consultar espacio ${idEspacio}: ${error}`);
            return null;
        }
    }
    async marcarOcupado(idEspacio, authHeader) {
        await this.cambiarEstado(idEspacio, 'OCUPADO', authHeader);
    }
    async marcarLibre(idEspacio, authHeader) {
        await this.cambiarEstado(idEspacio, 'DISPONIBLE', authHeader);
    }
    async cambiarEstado(idEspacio, estado, authHeader) {
        const headers = authHeader ? { Authorization: authHeader } : undefined;
        const url = `${this.apiBase}/espacios/${encodeURIComponent(idEspacio)}/estado?estado=${estado}`;
        this.logger.log(`Cambiando estado de espacio: ${url}`);
        await (0, rxjs_1.firstValueFrom)(this.httpService.patch(url, undefined, { headers }));
    }
    get apiBase() {
        return this.baseUrl.endsWith('/api/v1') ? this.baseUrl : `${this.baseUrl}/api/v1`;
    }
    mapEspacio(data, fallbackId) {
        return {
            id: data.id || fallbackId,
            tipo: String(data.tipoEspacio || data.tipo || 'regular').toLowerCase(),
            estado: String(data.estado || 'disponible').toLowerCase(),
        };
    }
};
exports.ZonasClientService = ZonasClientService;
exports.ZonasClientService = ZonasClientService = ZonasClientService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService,
        config_1.ConfigService])
], ZonasClientService);
//# sourceMappingURL=zonas-client.service.js.map