import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsEnum,
    IsNotEmpty,
    IsObject,
    IsOptional,
    IsString,
    MaxLength,
} from 'class-validator';
import { Microservicio, TipoAccion } from '../entities/trazabilidad.entity';

/**
 * DTO para registrar un evento de trazabilidad desde cualquier microservicio.
 * Usado por el endpoint POST /trazabilidad/registrar.
 */
export class RegistrarEventoDto {
    @ApiProperty({
        description: 'Microservicio de origen del evento',
        enum: Microservicio,
        example: Microservicio.VEHICULOS,
    })
    @IsEnum(Microservicio, { message: 'El microservicio debe ser uno válido: TRAZABILIDAD, USUARIOS, VEHICULOS, ZONAS, TICKETS' })
    @IsNotEmpty()
    microservicio: Microservicio;

    @ApiProperty({
        description: 'Endpoint que generó el evento (e.g. "POST /vehiculos")',
        example: 'POST /vehiculos',
    })
    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    endpoint: string;

    @ApiProperty({
        description: 'Método HTTP utilizado',
        example: 'POST',
    })
    @IsString()
    @IsNotEmpty()
    @MaxLength(10)
    metodoHttp: string;

    @ApiProperty({
        description: 'Tipo de acción realizada',
        enum: TipoAccion,
        example: TipoAccion.CREACION,
    })
    @IsEnum(TipoAccion, { message: 'El tipo de acción debe ser válido' })
    @IsNotEmpty()
    tipoAccion: TipoAccion;

    @ApiProperty({
        description: 'Descripción legible del evento (e.g. "Se creó vehículo Toyota Corolla placa ABC-123")',
        example: 'Se creó vehículo Toyota Corolla placa ABC-123',
    })
    @IsString()
    @IsNotEmpty()
    descripcion: string;

    @ApiPropertyOptional({
        description: 'ID de la entidad afectada (UUID o referencia)',
        example: 'b4e2c3d5-5678-4def-90ef-234567890bcd',
    })
    @IsOptional()
    @IsString()
    entidadId?: string;

    @ApiPropertyOptional({
        description: 'ID del usuario que ejecutó la acción (UUID del JWT)',
        example: 'a3f1b2c4-1234-4abc-89de-1234567890ab',
    })
    @IsOptional()
    @IsString()
    usuarioEjecutor?: string;

    @ApiPropertyOptional({
        description: 'Nombre legible del usuario que ejecutó la acción',
        example: 'admin',
    })
    @IsOptional()
    @IsString()
    @MaxLength(255)
    usuarioEjecutorNombre?: string;

    @ApiPropertyOptional({
        description: 'ID del propietario afectado (solo para eventos de asignaciones)',
    })
    @IsOptional()
    @IsString()
    userId?: string;

    @ApiPropertyOptional({
        description: 'ID del vehículo afectado (solo para eventos de asignaciones)',
    })
    @IsOptional()
    @IsString()
    vehicleId?: string;

    @ApiPropertyOptional({
        description: 'Estado/payload anterior al cambio (null en CREACION)',
        example: null,
    })
    @IsOptional()
    @IsObject()
    payloadAnterior?: Record<string, any> | null;

    @ApiPropertyOptional({
        description: 'Estado/payload nuevo después del cambio (null en ELIMINACION)',
        example: { placa: 'ABC-123', marca: 'Toyota', modelo: 'Corolla' },
    })
    @IsOptional()
    @IsObject()
    payloadNuevo?: Record<string, any> | null;
}
