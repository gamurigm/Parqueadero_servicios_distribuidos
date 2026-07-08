export declare enum TicketEstado {
    ACTIVO = "ACTIVO",
    PAGADO = "PAGADO",
    ANULADO = "ANULADO"
}
export declare class TicketEntity {
    id: string;
    codigoTicket: string;
    idEspacio: string;
    cedula?: string;
    placa: string;
    estado: TicketEstado;
    fechaIngreso: Date;
    fechaSalida?: Date;
    idEmpleado: string;
    idEmpleadoPago?: string;
    idEmpleadoAnula?: string;
    valorRecaudado?: number;
    motivoAnulacion?: string;
    createdAt: Date;
    updatedAt: Date;
}
