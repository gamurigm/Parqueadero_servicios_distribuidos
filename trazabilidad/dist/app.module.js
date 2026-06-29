"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const axios_1 = require("@nestjs/axios");
const asignacion_module_1 = require("./asignacion/asignacion.module");
const trazabilidad_module_1 = require("./trazabilidad/trazabilidad.module");
const vehiculos_client_module_1 = require("./vehiculos-client/vehiculos-client.module");
const asignacion_entity_1 = require("./asignacion/entities/asignacion.entity");
const trazabilidad_entity_1 = require("./trazabilidad/entities/trazabilidad.entity");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: '.env',
            }),
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                useFactory: (configService) => ({
                    type: 'postgres',
                    host: configService.get('DB_HOST', 'localhost'),
                    port: configService.get('DB_PORT', 5440),
                    username: configService.get('DB_USUARIO', 'admin_user'),
                    password: configService.get('DB_CONTRASENA', 'xasmdno123XAW2342as'),
                    database: configService.get('DB_NOMBRE', 'TrazabilidadDB'),
                    entities: [asignacion_entity_1.Asignacion, trazabilidad_entity_1.EventoTrazabilidad],
                    synchronize: true,
                    logging: true,
                }),
                inject: [config_1.ConfigService],
            }),
            axios_1.HttpModule.register({
                timeout: 5000,
                maxRedirects: 5,
            }),
            asignacion_module_1.AsignacionModule,
            trazabilidad_module_1.TrazabilidadModule,
            vehiculos_client_module_1.VehiculosClientModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map