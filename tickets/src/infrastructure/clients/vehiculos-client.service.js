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
var VehiculosClientService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.VehiculosClientService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const config_1 = require("@nestjs/config");
const rxjs_1 = require("rxjs");
let VehiculosClientService = VehiculosClientService_1 = class VehiculosClientService {
    constructor(httpService, configService) {
        this.httpService = httpService;
        this.configService = configService;
        this.logger = new common_1.Logger(VehiculosClientService_1.name);
        this.baseUrl = this.configService.get('VEHICULOS_SERVICE_URL', 'http://localhost:3000');
    }
    async buscarPorPlaca(placa, authHeader) {
        const placaNormalizada = placa.trim().toUpperCase();
        const headers = authHeader ? { Authorization: authHeader } : undefined;
        try {
            const url = `${this.baseUrl}/vehiculos/placa/${encodeURIComponent(placaNormalizada)}`;
            this.logger.log(`Buscando vehiculo por placa: ${url}`);
            const res = await (0, rxjs_1.firstValueFrom)(this.httpService.get(url, { headers }));
            return this.mapVehiculo(res.data, placaNormalizada);
        }
        catch (error) {
            if (error.response?.status !== 404) {
                this.logger.warn(`Busqueda directa por placa no disponible: ${error.message}`);
            }
        }
        try {
            const url = `${this.baseUrl}/vehiculos`;
            this.logger.log(`Buscando vehiculo por placa en listado: ${url}`);
            const res = await (0, rxjs_1.firstValueFrom)(this.httpService.get(url, { headers }));
            const vehiculos = Array.isArray(res.data) ? res.data : [];
            const encontrado = vehiculos.find((v) => String(v.placa ?? '').trim().toUpperCase() === placaNormalizada);
            return encontrado ? this.mapVehiculo(encontrado, placaNormalizada) : null;
        }
        catch (error) {
            this.logger.error(`Error al buscar vehiculo por placa ${placaNormalizada}: ${error.message}`);
            return null;
        }
    }
    mapVehiculo(data, placa) {
        if (!data)
            return null;
        return {
            id: data.id || '',
            placa: data.placa || placa,
            tipo: data.tipo || data.type || data.discriminator || 'Automovil',
            cedulaPropietario: data.cedulaPropietario || data.cedula || undefined,
        };
    }
};
exports.VehiculosClientService = VehiculosClientService;
exports.VehiculosClientService = VehiculosClientService = VehiculosClientService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService,
        config_1.ConfigService])
], VehiculosClientService);
//# sourceMappingURL=vehiculos-client.service.js.map