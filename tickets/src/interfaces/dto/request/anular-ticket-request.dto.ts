import { IsNotEmpty, IsOptional, IsString, MinLength, ValidateIf } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AnularTicketRequestDto {
  @ApiPropertyOptional({ example: 'uuid-del-ticket', description: 'UUID del ticket (opcional si se envía código)' })
  @ValidateIf(o => !o.codigoTicket)
  @IsNotEmpty({ message: 'Debe proporcionar el idTicket si no proporciona el codigoTicket' })
  @IsString()
  idTicket?: string;

  @ApiPropertyOptional({ example: '1000012345678901', description: 'Código único de 16 dígitos del ticket (opcional si se envía id)' })
  @ValidateIf(o => !o.idTicket)
  @IsNotEmpty({ message: 'Debe proporcionar el codigoTicket si no proporciona el idTicket' })
  @IsString()
  @MinLength(16)
  codigoTicket?: string;



  @ApiProperty({ example: 'Cliente no encontró espacio', description: 'Motivo de la anulación' })
  @IsNotEmpty({ message: 'El motivo de anulación es obligatorio' })
  @IsString()
  @MinLength(5)
  motivo: string;
}
