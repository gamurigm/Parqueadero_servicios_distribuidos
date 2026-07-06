import { Ticket } from './ticket.entity';
import { TicketStatus } from './ticket-status.enum';

describe('Ticket Entity', () => {
  const idEmpleado = 'EMP-001';

  it('debe crearse un ticket activo', () => {
    const ticket = Ticket.activo(
      'uuid-123',
      '1234567890123456',
      'ESP-001',
      '1234567890',
      'ABC-123',
      idEmpleado,
    );

    expect(ticket.id).toBe('uuid-123');
    expect(ticket.estado).toBe(TicketStatus.ACTIVO);
    expect(ticket.transicionEstado).toBe(TicketStatus.ACTIVO);
  });

  it('debe permitir pagar un ticket activo', () => {
    const ticket = Ticket.activo(
      'uuid-123',
      '1234567890123456',
      'ESP-001',
      '1234567890',
      'ABC-123',
      idEmpleado,
    );

    ticket.pagar(new Date(), 2.50, idEmpleado);

    expect(ticket.estado).toBe(TicketStatus.PAGADO);
    expect(ticket.valorRecaudado).toBe(2.50);
  });

  it('debe permitir anular un ticket dentro del tiempo límite', () => {
    const ticket = Ticket.activo(
      'uuid-123',
      '1234567890123456',
      'ESP-001',
      '1234567890',
      'ABC-123',
      idEmpleado,
    );

    ticket.anular('Error de cliente', idEmpleado, 15);

    expect(ticket.estado).toBe(TicketStatus.ANULADO);
    expect(ticket.motivoAnulacion).toBe('Error de cliente');
  });

  it('no debe permitir anular un ticket fuera del tiempo límite', () => {
    const ticket = Ticket.activo(
      'uuid-123',
      '1234567890123456',
      'ESP-001',
      '1234567890',
      'ABC-123',
      idEmpleado,
    );

    // Mock fechaIngreso to be 20 mins ago
    Object.defineProperty(ticket, 'fechaIngreso', {
      value: new Date(Date.now() - 20 * 60000), // 20 minutes ago
    });

    expect(() => ticket.anular('Tarde', idEmpleado, 15)).toThrow(/Han pasado/);
  });

  it('no debe permitir anular un ticket pagado', () => {
    const ticket = Ticket.activo(
      'uuid-123',
      '1234567890123456',
      'ESP-001',
      '1234567890',
      'ABC-123',
      idEmpleado,
    );
    ticket.pagar(new Date(), 2.50, idEmpleado);

    expect(() => ticket.anular('Intentar anular', idEmpleado, 15)).toThrow(/No se puede anular un ticket en estado PAGADO/);
  });
});
