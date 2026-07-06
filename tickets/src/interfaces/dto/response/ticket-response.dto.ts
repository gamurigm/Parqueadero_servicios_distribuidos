import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TicketResponseDto {
  @ApiProperty({ example: 'uuid-del-ticket' })
  id: string;

  @ApiProperty({ example: '1000012345678901' })
  codigoTicket: string;

  @ApiProperty({ example: 'ESP-001' })
  idEspacio: string;

  @ApiProperty({ example: '1234567890', required: false })
  cedula?: string;

  @ApiProperty({ example: 'ABC-1234' })
  placa: string;

  @ApiProperty({ example: 'ACTIVO', enum: ['ACTIVO', 'PAGADO', 'ANULADO'] })
  estado: string;

  @ApiProperty({ example: '2026-07-01T10:00:00Z' })
  fechaIngreso: Date;

  @ApiPropertyOptional({ example: '2026-07-01T12:30:00Z' })
  fechaSalida?: Date;

  @ApiPropertyOptional({ example: 5.00 })
  valorRecaudado?: number;

  @ApiPropertyOptional({ example: 'Cliente no encontró espacio' })
  motivoAnulacion?: string;

  @ApiProperty({ example: 'EMP-001' })
  idEmpleado: string;
}
