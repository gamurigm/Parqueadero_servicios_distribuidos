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
var TarifaProviderService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TarifaProviderService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let TarifaProviderService = TarifaProviderService_1 = class TarifaProviderService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(TarifaProviderService_1.name);
        this.tarifas = {};
        this.tarifas['AUTO_REGULAR'] = this.getEnvNum('TARIFA_AUTO_REGULAR', 2.50);
        this.tarifas['AUTO_RESERVADO'] = this.getEnvNum('TARIFA_AUTO_RESERVADO', 5.00);
        this.tarifas['MOTO_REGULAR'] = this.getEnvNum('TARIFA_MOTO_REGULAR', 1.50);
        this.tarifas['MOTO_RESERVADO'] = this.getEnvNum('TARIFA_MOTO_RESERVADO', 3.00);
        this.tarifas['CAMIONETA_REGULAR'] = this.getEnvNum('TARIFA_CAMIONETA_REGULAR', 3.50);
        this.tarifas['CAMIONETA_RESERVADO'] = this.getEnvNum('TARIFA_CAMIONETA_RESERVADO', 6.00);
    }
    obtenerTarifaPorHora(tipoVehiculo, tipoEspacio) {
        const tipoV = tipoVehiculo.toUpperCase().replace(/[^A-Z]/g, '');
        const tipoE = tipoEspacio.toUpperCase().replace(/[^A-Z]/g, '');
        const key = `${tipoV}_${tipoE}`;
        const tarifa = this.tarifas[key];
        if (tarifa === undefined) {
            this.logger.warn(`Tarifa no encontrada para ${key}, usando tarifa default AUTO_REGULAR`);
            return this.tarifas['AUTO_REGULAR'] || 2.50;
        }
        return tarifa;
    }
    getEnvNum(key, defaultValue) {
        const val = this.configService.get(key);
        return val ? parseFloat(val) : defaultValue;
    }
};
exports.TarifaProviderService = TarifaProviderService;
exports.TarifaProviderService = TarifaProviderService = TarifaProviderService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], TarifaProviderService);
//# sourceMappingURL=tarifa-provider.service.js.map