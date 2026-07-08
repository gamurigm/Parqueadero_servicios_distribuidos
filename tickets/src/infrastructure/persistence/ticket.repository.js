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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TicketRepository = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const ticket_entity_1 = require("./ticket.entity");
const ticket_entity_2 = require("../../domain/ticket.entity");
const ticket_status_enum_1 = require("../../domain/ticket-status.enum");
let TicketRepository = class TicketRepository {
    constructor(repo, dataSource) {
        this.repo = repo;
        this.dataSource = dataSource;
    }
    async findAll() {
        const entities = await this.repo.find({
            order: { fechaIngreso: 'DESC' },
        });
        return entities.map((entity) => this.toDomain(entity));
    }
    async findById(id) {
        const entity = await this.repo.findOne({ where: { id } });
        return entity ? this.toDomain(entity) : null;
    }
    async findByCodigo(codigo) {
        const entity = await this.repo.findOne({ where: { codigoTicket: codigo } });
        return entity ? this.toDomain(entity) : null;
    }
    async findActivoByEspacio(idEspacio) {
        const entity = await this.repo.findOne({
            where: { idEspacio, estado: ticket_entity_1.TicketEstado.ACTIVO },
        });
        return entity ? this.toDomain(entity) : null;
    }
    async findActivoByPlaca(placa) {
        const entity = await this.repo.findOne({
            where: { placa, estado: ticket_entity_1.TicketEstado.ACTIVO },
        });
        return entity ? this.toDomain(entity) : null;
    }
    async save(ticket) {
        const entity = this.toEntity(ticket);
        const saved = await this.repo.save(entity);
        return this.toDomain(saved);
    }
    async update(ticket) {
        const entity = this.toEntity(ticket);
        const saved = await this.repo.save(entity);
        return this.toDomain(saved);
    }
    toDomain(entity) {
        return new ticket_entity_2.Ticket(entity.id, entity.codigoTicket, entity.idEspacio, entity.cedula, entity.placa, ticket_status_enum_1.TicketStatus[entity.estado], entity.fechaIngreso, entity.idEmpleado, entity.fechaSalida, entity.valorRecaudado ? Number(entity.valorRecaudado) : undefined, entity.motivoAnulacion);
    }
    toEntity(ticket) {
        const entity = new ticket_entity_1.TicketEntity();
        entity.id = ticket.id;
        entity.codigoTicket = ticket.codigoTicket;
        entity.idEspacio = ticket.idEspacio;
        entity.cedula = ticket.cedula;
        entity.placa = ticket.placa;
        entity.estado = ticket_entity_1.TicketEstado[ticket.estado];
        entity.fechaIngreso = ticket.fechaIngreso;
        entity.fechaSalida = ticket.fechaSalida;
        entity.idEmpleado = ticket.idEmpleado;
        entity.valorRecaudado = ticket.valorRecaudado;
        entity.motivoAnulacion = ticket.motivoAnulacion;
        return entity;
    }
};
exports.TicketRepository = TicketRepository;
exports.TicketRepository = TicketRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(ticket_entity_1.TicketEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.DataSource])
], TicketRepository);
//# sourceMappingURL=ticket.repository.js.map