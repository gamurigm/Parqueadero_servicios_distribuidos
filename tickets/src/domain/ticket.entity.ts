import { TicketStatus } from './ticket-status.enum';

export class Ticket {
  constructor(
    public readonly id: string,
    public readonly codigoTicket: string,
    public readonly idEspacio: string,
    public readonly cedula: string,
    public readonly placa: string,
    public estado: TicketStatus,
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
    this.estado = TicketStatus.PAGADO;
  }

  anular(motivo: string, empleadoAnula: string, limiteMinutos: number = 15): void {
    if (this.estado !== TicketStatus.ACTIVO) {
      throw new Error(`No se puede anular un ticket en estado ${this.estado}`);
    }
    const ahora = new Date();
    const diffMs = ahora.getTime() - this.fechaIngreso.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins > limiteMinutos) {
      throw new Error(`No se puede anular el ticket. Han pasado ${diffMins} minutos desde la emisión (límite: ${limiteMinutos} minutos)`);
    }
    this.motivoAnulacion = motivo;
    this.estado = TicketStatus.ANULADO;
  }

  get transicionEstado(): TicketStatus {
    if (this.estado === TicketStatus.ACTIVO && this.fechaSalida) return TicketStatus.PAGADO;
    if (this.estado === TicketStatus.ACTIVO && this.motivoAnulacion) return TicketStatus.ANULADO;
    return this.estado;
  }
}
