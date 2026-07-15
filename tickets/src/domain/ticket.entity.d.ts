import { TicketStatus } from './ticket-status.enum';
export declare class Ticket {
    readonly id: string;
    readonly codigoTicket: string;
    readonly idEspacio: string;
    readonly cedula: string | undefined;
    readonly placa: string;
    estado: TicketStatus;
    readonly fechaIngreso: Date;
    readonly idEmpleado: string;
    fechaSalida?: Date;
    valorRecaudado?: number;
    motivoAnulacion?: string;
    constructor(id: string, codigoTicket: string, idEspacio: string, cedula: string | undefined, placa: string, estado: TicketStatus, fechaIngreso: Date, idEmpleado: string, fechaSalida?: Date, valorRecaudado?: number, motivoAnulacion?: string);
    static activo(id: string, codigoTicket: string, idEspacio: string, cedula: string | undefined, placa: string, idEmpleado: string): Ticket;
    pagar(fechaSalida: Date, valor: number, empleadoPago: string): void;
    anular(motivo: string, empleadoAnula: string, limiteMinutos?: number): void;
    get transicionEstado(): TicketStatus;
}
