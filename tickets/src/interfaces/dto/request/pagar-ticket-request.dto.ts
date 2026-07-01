import { IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PagarTicketRequestDto {
  @ApiPropertyOptional({ example: 'uuid-del-ticket', description: 'UUID del ticket (opcional si se envía código)' })
  @IsOptional()
  @IsString()
  idTicket?: string;

  @ApiPropertyOptional({ example: '1000012345678901', description: 'Código único de 16 dígitos del ticket (opcional si se envía id)' })
  @IsOptional()
  @IsString()
  @MinLength(16)
  codigoTicket?: string;

  @ApiProperty({ example: 'EMP-002', description: 'ID del empleado que procesa el pago' })
  @IsNotEmpty({ message: 'El idEmpleado no puede estar vacío' })
  @IsString()
  @MinLength(1)
  idEmpleado: string;
}
