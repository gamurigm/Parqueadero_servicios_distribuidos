import { IsNotEmpty, IsOptional, IsString, MinLength, ValidateIf, IsUUID } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AnularTicketRequestDto {
  @ApiPropertyOptional({ example: 'uuid-del-ticket', description: 'UUID del ticket (opcional si se envía código)' })
  @ValidateIf(o => !o.codigoTicket)
  @IsNotEmpty({ message: 'Debe proporcionar el idTicket si no proporciona el codigoTicket' })
  @Transform(({ value }) => value?.trim())
  @IsUUID('4', { message: 'El idTicket debe ser un UUID válido' })
  idTicket?: string;

  @ApiPropertyOptional({ example: '1000012345678901', description: 'Código único de 16 dígitos del ticket (opcional si se envía id)' })
  @ValidateIf(o => !o.idTicket)
  @IsNotEmpty({ message: 'Debe proporcionar el codigoTicket si no proporciona el idTicket' })
  @Transform(({ value }) => value?.trim())
  @IsString()
  @MinLength(16)
  codigoTicket?: string;

  @ApiProperty({ example: 'Cliente no encontró espacio', description: 'Motivo de la anulación' })
  @IsNotEmpty({ message: 'El motivo de anulación es obligatorio' })
  @Transform(({ value }) => value?.trim())
  @IsString()
  @MinLength(5)
  motivo: string;
}
