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
var OpaService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpaService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let OpaService = OpaService_1 = class OpaService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(OpaService_1.name);
        this.opaUrl = this.configService.get('OPA_URL', 'http://opa:8181/v1/data');
        this.serviceName = this.configService.get('OPA_SERVICE', 'tickets');
    }
    async checkPermission(input) {
        try {
            const url = `${this.opaUrl}/authz/${this.serviceName}`;
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ input }),
                signal: AbortSignal.timeout(500),
            });
            if (!response.ok) {
                this.logger.error(`Error de OPA HTTP ${response.status}`);
                return false;
            }
            const data = await response.json();
            const allow = data.result?.allow === true;
            if (!allow) {
                this.logger.warn(`Acceso denegado por OPA: ${JSON.stringify(input)}`);
            }
            return allow;
        }
        catch (error) {
            this.logger.error(`Error conectando con OPA: ${error.message}`);
            return false;
        }
    }
};
exports.OpaService = OpaService;
exports.OpaService = OpaService = OpaService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], OpaService);
//# sourceMappingURL=opa.service.js.map