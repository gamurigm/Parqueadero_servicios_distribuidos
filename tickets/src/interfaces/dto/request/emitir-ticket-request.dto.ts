import { IsNotEmpty, IsOptional, IsString, MinLength, MaxLength, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class EmitirTicketRequestDto {
  @ApiProperty({ example: 'ESP-001', description: 'ID del espacio de parqueo' })
  @IsNotEmpty({ message: 'El idEspacio no puede estar vacío' })
  @IsString()
  @MinLength(1)
  idEspacio: string;

  @ApiPropertyOptional({ example: '1234567890', description: 'Cédula del propietario (opcional si se envía placa)' })
  @IsOptional()
  @IsString()
  @Matches(/^\d{6,20}$/, { message: 'La cédula debe contener solo dígitos' })
  cedula?: string;

  @ApiPropertyOptional({ example: 'ABC-1234', description: 'Placa del vehículo (opcional si se envía cédula)' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(20)
  placa?: string;

  @ApiProperty({ example: 'EMP-001', description: 'ID del empleado que emite el ticket' })
  @IsNotEmpty({ message: 'El idEmpleado no puede estar vacío' })
  @IsString()
  @MinLength(1)
  idEmpleado: string;
}
