export declare class TicketResponseDto {
    id: string;
    codigoTicket: string;
    idEspacio: string;
    cedula?: string;
    placa: string;
    estado: string;
    fechaIngreso: Date;
    fechaSalida?: Date;
    valorRecaudado?: number;
    motivoAnulacion?: string;
    idEmpleado: string;
}
