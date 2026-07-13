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
var UsuariosClientService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsuariosClientService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const config_1 = require("@nestjs/config");
const rxjs_1 = require("rxjs");
let UsuariosClientService = UsuariosClientService_1 = class UsuariosClientService {
    constructor(httpService, configService) {
        this.httpService = httpService;
        this.configService = configService;
        this.logger = new common_1.Logger(UsuariosClientService_1.name);
        this.usuariosBaseUrl = this.configService.get('USUARIOS_SERVICE_URL', 'http://localhost:5000');
        this.trazabilidadBaseUrl = this.configService.get('TRAZABILIDAD_SERVICE_URL', 'http://trazabilidad:3002');
    }
    async obtenerVehiculosPorCedula(cedula, authHeader) {
        const headers = authHeader ? { Authorization: authHeader } : undefined;
        try {
            const persona = await this.obtenerPersonaPorCedula(cedula, headers);
            if (!persona?.id) {
                this.logger.warn(`Persona con cedula ${cedula} no encontrada`);
                return [];
            }
            const vehiculosUrl = `${this.trazabilidadBaseUrl}/asignaciones/propietario/${persona.id}`;
            this.logger.log(`Consultando vehiculos asociados a cedula: ${vehiculosUrl}`);
            const resVehiculos = await (0, rxjs_1.firstValueFrom)(this.httpService.get(vehiculosUrl, { headers }));
            const vehiculos = Array.isArray(resVehiculos.data) ? resVehiculos.data : [];
            return vehiculos
                .filter((v) => v.placa || v.plate)
                .map((v) => ({
                placa: v.placa || v.plate || '',
                tipo: v.tipo || v.type || 'Automovil',
            }));
        }
        catch (error) {
            this.logger.error(`Error al consultar vehiculos por cedula ${cedula}: ${error.message}`);
            return [];
        }
    }
    async obtenerPersonaPorCedula(cedula, headers) {
        try {
            const url = `${this.usuariosBaseUrl}/persona/cedula/${cedula}`;
            this.logger.log(`Consultando persona por cedula: ${url}`);
            const res = await (0, rxjs_1.firstValueFrom)(this.httpService.get(url, { headers }));
            return res.data ?? null;
        }
        catch (error) {
            if (error.response?.status !== 404) {
                this.logger.warn(`Busqueda directa por cedula no disponible: ${error.message}`);
            }
        }
        const url = `${this.usuariosBaseUrl}/persona`;
        this.logger.log(`Consultando personas para buscar cedula: ${url}`);
        const res = await (0, rxjs_1.firstValueFrom)(this.httpService.get(url, { headers }));
        const personas = Array.isArray(res.data) ? res.data : [];
        return personas.find((p) => String(p.dni ?? p.cedula ?? '') === cedula) ?? null;
    }
};
exports.UsuariosClientService = UsuariosClientService;
exports.UsuariosClientService = UsuariosClientService = UsuariosClientService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService,
        config_1.ConfigService])
], UsuariosClientService);
//# sourceMappingURL=usuarios-client.service.js.map