"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TicketCodeGeneratorService = void 0;
const common_1 = require("@nestjs/common");
let TicketCodeGeneratorService = class TicketCodeGeneratorService {
    generar(idEspacio, tipoEspacio) {
        const now = Date.now().toString();
        const espacioDigitos = idEspacio.replace(/\D/g, '').padStart(6, '0').slice(-6);
        const tipoDigito = tipoEspacio === 'reservado' ? '9' : '1';
        const timestampDigitos = now.slice(-9);
        const code = `${tipoDigito}${espacioDigitos}${timestampDigitos}`;
        return code.padEnd(16, '0').slice(0, 16);
    }
};
exports.TicketCodeGeneratorService = TicketCodeGeneratorService;
exports.TicketCodeGeneratorService = TicketCodeGeneratorService = __decorate([
    (0, common_1.Injectable)()
], TicketCodeGeneratorService);
//# sourceMappingURL=ticket-code-generator.service.js.map