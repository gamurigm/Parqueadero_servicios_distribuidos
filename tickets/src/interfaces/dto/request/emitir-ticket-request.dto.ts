import { IsNotEmpty, IsOptional, IsString, MinLength, MaxLength, Matches, ValidateIf, IsUUID } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class EmitirTicketRequestDto {
  @ApiProperty({ example: 'ESP-001', description: 'ID del espacio de parqueo' })
  @IsNotEmpty({ message: 'El idEspacio no puede estar vacío' })
  @Transform(({ value }) => value?.trim())
  @IsUUID('4', { message: 'El idEspacio debe ser un UUID válido' })
  idEspacio: string;

  @ApiPropertyOptional({ example: '1234567890', description: 'Cédula del propietario (opcional si se envía placa)' })
  @ValidateIf(o => !o.placa)
  @IsNotEmpty({ message: 'Debe proporcionar la cédula si no proporciona la placa' })
  @Transform(({ value }) => value?.trim())
  @IsString()
  @Matches(/^\d{6,20}$/, { message: 'La cédula debe contener solo dígitos' })
  cedula?: string;

  @ApiPropertyOptional({ example: 'ABC-1234', description: 'Placa del vehículo (opcional si se envía cédula)' })
  @ValidateIf(o => !o.cedula)
  @IsNotEmpty({ message: 'Debe proporcionar la placa si no proporciona la cédula' })
  @Transform(({ value }) => value?.trim())
  @IsString()
  @MinLength(1)
  @MaxLength(20)
  placa?: string;


}
