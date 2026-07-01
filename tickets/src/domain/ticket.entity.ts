import { TicketStatus } from './ticket-status.enum';

export class Ticket {
  constructor(
    public readonly id: string,
    public readonly codigoTicket: string,
    public readonly idEspacio: string,
    public readonly cedula: string,
    public readonly placa: string,
    public readonly estado: TicketStatus,
    public readonly fechaIngreso: Date,
    public readonly idEmpleado: string,
    public fechaSalida?: Date,
    public valorRecaudado?: number,
    public motivoAnulacion?: string,
  ) {}

  static activo(
    id: string,
    codigoTicket: string,
    idEspacio: string,
    cedula: string,
    placa: string,
    idEmpleado: string,
  ): Ticket {
    return new Ticket(
      id,
      codigoTicket,
      idEspacio,
      cedula,
      placa,
      TicketStatus.ACTIVO,
      new Date(),
      idEmpleado,
    );
  }

  pagar(fechaSalida: Date, valor: number, empleadoPago: string): void {
    if (this.estado !== TicketStatus.ACTIVO) {
      throw new Error(`No se puede pagar un ticket en estado ${this.estado}`);
    }
    this.fechaSalida = fechaSalida;
    this.valorRecaudado = valor;
  }

  anular(motivo: string, empleadoAnula: string): void {
    if (this.estado !== TicketStatus.ACTIVO) {
      throw new Error(`No se puede anular un ticket en estado ${this.estado}`);
    }
    this.motivoAnulacion = motivo;
  }

  get transicionEstado(): TicketStatus {
    if (this.estado === TicketStatus.ACTIVO && this.fechaSalida) return TicketStatus.PAGADO;
    if (this.estado === TicketStatus.ACTIVO && this.motivoAnulacion) return TicketStatus.ANULADO;
    return this.estado;
  }
}
