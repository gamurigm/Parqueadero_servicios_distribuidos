"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TicketsModule = void 0;
const common_1 = require("@nestjs/common");
const tickets_controller_1 = require("./tickets.controller");
const emitir_ticket_use_case_1 = require("../../application/use-cases/emitir-ticket.use-case");
const pagar_ticket_use_case_1 = require("../../application/use-cases/pagar-ticket.use-case");
const anular_ticket_use_case_1 = require("../../application/use-cases/anular-ticket.use-case");
const ticket_repository_module_1 = require("../../infrastructure/persistence/ticket-repository.module");
const usuarios_client_module_1 = require("../../infrastructure/clients/usuarios-client.module");
const vehiculos_client_module_1 = require("../../infrastructure/clients/vehiculos-client.module");
const zonas_client_module_1 = require("../../infrastructure/clients/zonas-client.module");
const ticket_repository_1 = require("../../infrastructure/persistence/ticket.repository");
const usuarios_client_service_1 = require("../../infrastructure/clients/usuarios-client.service");
const vehiculos_client_service_1 = require("../../infrastructure/clients/vehiculos-client.service");
const zonas_client_service_1 = require("../../infrastructure/clients/zonas-client.service");
const trazabilidad_client_module_1 = require("../../infrastructure/clients/trazabilidad-client.module");
const ticket_code_generator_service_1 = require("../../infrastructure/services/ticket-code-generator.service");
const tarifa_provider_service_1 = require("../../infrastructure/services/tarifa-provider.service");
const ticket_repository_interface_1 = require("../../application/ports/ticket-repository.interface");
const usuarios_client_interface_1 = require("../../application/ports/usuarios-client.interface");
const vehiculos_client_interface_1 = require("../../application/ports/vehiculos-client.interface");
const zonas_client_interface_1 = require("../../application/ports/zonas-client.interface");
const ticket_code_generator_interface_1 = require("../../application/ports/ticket-code-generator.interface");
const tarifa_provider_interface_1 = require("../../application/ports/tarifa-provider.interface");
let TicketsModule = class TicketsModule {
};
exports.TicketsModule = TicketsModule;
exports.TicketsModule = TicketsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            ticket_repository_module_1.TicketRepositoryModule,
            usuarios_client_module_1.UsuariosClientModule,
            vehiculos_client_module_1.VehiculosClientModule,
            zonas_client_module_1.ZonasClientModule,
            trazabilidad_client_module_1.TrazabilidadClientModule,
        ],
        controllers: [tickets_controller_1.TicketsController],
        providers: [
            { provide: ticket_repository_interface_1.TICKET_REPOSITORY, useExisting: ticket_repository_1.TicketRepository },
            { provide: usuarios_client_interface_1.USUARIOS_CLIENT, useExisting: usuarios_client_service_1.UsuariosClientService },
            { provide: vehiculos_client_interface_1.VEHICULOS_CLIENT, useExisting: vehiculos_client_service_1.VehiculosClientService },
            { provide: zonas_client_interface_1.ZONAS_CLIENT, useExisting: zonas_client_service_1.ZonasClientService },
            { provide: ticket_code_generator_interface_1.TICKET_CODE_GENERATOR, useExisting: ticket_code_generator_service_1.TicketCodeGeneratorService },
            { provide: tarifa_provider_interface_1.TARIFA_PROVIDER, useExisting: tarifa_provider_service_1.TarifaProviderService },
            emitir_ticket_use_case_1.EmitirTicketUseCase,
            pagar_ticket_use_case_1.PagarTicketUseCase,
            anular_ticket_use_case_1.AnularTicketUseCase,
        ],
    })
], TicketsModule);
//# sourceMappingURL=tickets.module.js.map