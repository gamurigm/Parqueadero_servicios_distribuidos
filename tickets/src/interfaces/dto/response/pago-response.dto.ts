import { ApiProperty } from '@nestjs/swagger';

export class PagoResponseDto {
  @ApiProperty({ example: 'uuid-del-ticket' })
  id: string;

  @ApiProperty({ example: '1000012345678901' })
  codigoTicket: string;

  @ApiProperty({ example: 'PAGADO' })
  estado: string;

  @ApiProperty({ example: '2026-07-01T10:00:00Z' })
  fechaIngreso: Date;

  @ApiProperty({ example: '2026-07-01T12:30:00Z' })
  fechaSalida: Date;

  @ApiProperty({ example: 5.00 })
  valorRecaudado: number;

  @ApiProperty({ example: 3 })
  horasCobradas: number;

  @ApiProperty({ example: 2.50 })
  tarifaPorHora: number;
}
