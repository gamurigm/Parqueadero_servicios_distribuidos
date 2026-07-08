"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Ticket = void 0;
const ticket_status_enum_1 = require("./ticket-status.enum");
class Ticket {
    constructor(id, codigoTicket, idEspacio, cedula, placa, estado, fechaIngreso, idEmpleado, fechaSalida, valorRecaudado, motivoAnulacion) {
        this.id = id;
        this.codigoTicket = codigoTicket;
        this.idEspacio = idEspacio;
        this.cedula = cedula;
        this.placa = placa;
        this.estado = estado;
        this.fechaIngreso = fechaIngreso;
        this.idEmpleado = idEmpleado;
        this.fechaSalida = fechaSalida;
        this.valorRecaudado = valorRecaudado;
        this.motivoAnulacion = motivoAnulacion;
    }
    static activo(id, codigoTicket, idEspacio, cedula, placa, idEmpleado) {
        return new Ticket(id, codigoTicket, idEspacio, cedula, placa, ticket_status_enum_1.TicketStatus.ACTIVO, new Date(), idEmpleado);
    }
    pagar(fechaSalida, valor, empleadoPago) {
        if (this.estado !== ticket_status_enum_1.TicketStatus.ACTIVO) {
            throw new Error(`No se puede pagar un ticket en estado ${this.estado}`);
        }
        this.fechaSalida = fechaSalida;
        this.valorRecaudado = valor;
        this.estado = ticket_status_enum_1.TicketStatus.PAGADO;
    }
    anular(motivo, empleadoAnula, limiteMinutos = 15) {
        if (this.estado !== ticket_status_enum_1.TicketStatus.ACTIVO) {
            throw new Error(`No se puede anular un ticket en estado ${this.estado}`);
        }
        const ahora = new Date();
        const diffMs = ahora.getTime() - this.fechaIngreso.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        if (diffMins > limiteMinutos) {
            throw new Error(`No se puede anular el ticket. Han pasado ${diffMins} minutos desde la emisión (límite: ${limiteMinutos} minutos)`);
        }
        this.motivoAnulacion = motivo;
        this.estado = ticket_status_enum_1.TicketStatus.ANULADO;
    }
    get transicionEstado() {
        if (this.estado === ticket_status_enum_1.TicketStatus.ACTIVO && this.fechaSalida)
            return ticket_status_enum_1.TicketStatus.PAGADO;
        if (this.estado === ticket_status_enum_1.TicketStatus.ACTIVO && this.motivoAnulacion)
            return ticket_status_enum_1.TicketStatus.ANULADO;
        return this.estado;
    }
}
exports.Ticket = Ticket;
//# sourceMappingURL=ticket.entity.js.map