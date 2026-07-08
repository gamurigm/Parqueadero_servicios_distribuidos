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
    }
    async validarPropietario(userId, authHeader) {
        try {
            const headers = authHeader ? { Authorization: authHeader } : undefined;
            const urlUsuario = `${this.usuariosBaseUrl}/usuario/${userId}`;
            this.logger.log(`Validando usuario en API Usuarios (tabla usuarios): ${urlUsuario}`);
            const resUsuario = await (0, rxjs_1.firstValueFrom)(this.httpService.get(urlUsuario, { headers }));
            if (!resUsuario.data || !resUsuario.data.active) {
                throw new common_1.NotFoundException(`El usuario con ID ${userId} no esta activo en el sistema`);
            }
            const urlRoles = `${this.usuariosBaseUrl}/roles`;
            const resRoles = await (0, rxjs_1.firstValueFrom)(this.httpService.get(urlRoles, { headers }));
            const roles = resRoles.data;
            const rolPropietario = roles.find((r) => r.nombre.toLowerCase().includes('propietario'));
            if (!rolPropietario) {
                this.logger.warn('El rol "Propietario" no esta definido en el sistema de roles.');
            }
            else {
                const urlRolesUsuario = `${this.usuariosBaseUrl}/roles-Usuario/usuarios/${userId}`;
                const resRolesUsuario = await (0, rxjs_1.firstValueFrom)(this.httpService.get(urlRolesUsuario, { headers }));
                const rolesAsignados = resRolesUsuario.data;
                const tieneRol = rolesAsignados.some((asignacion) => asignacion.id_rol === rolPropietario.id && asignacion.activo === true);
                if (!tieneRol) {
                    throw new common_1.NotFoundException(`El usuario ${userId} existe, pero no es de tipo "Propietario"`);
                }
            }
            return resUsuario.data;
        }
        catch (error) {
            this.logger.error(`Error al consultar propietario ${userId}: ${error.message}`);
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            if (error.response?.status === 404) {
                throw new common_1.NotFoundException(`El usuario con ID ${userId} no existe en la tabla de usuarios o no tiene roles.`);
            }
            throw new Error('Servicio de usuarios no disponible para validacion');
        }
    }
    async obtenerUsuario(userId, authHeader) {
        try {
            const urlUsuario = `${this.usuariosBaseUrl}/usuario/${userId}`;
            this.logger.log(`Consultando usuario para trazabilidad: ${urlUsuario}`);
            const headers = authHeader ? { Authorization: authHeader } : undefined;
            const resUsuario = await (0, rxjs_1.firstValueFrom)(this.httpService.get(urlUsuario, { headers }));
            return resUsuario.data ?? null;
        }
        catch (error) {
            this.logger.warn(`No se pudo obtener el usuario ${userId}: ${error.message}`);
            return null;
        }
    }
};
exports.UsuariosClientService = UsuariosClientService;
exports.UsuariosClientService = UsuariosClientService = UsuariosClientService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService,
        config_1.ConfigService])
], UsuariosClientService);
//# sourceMappingURL=usuarios-client.service.js.map