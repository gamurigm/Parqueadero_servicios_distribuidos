import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

/**
 * DTO para crear una nueva asignación vehículo-propietario.
 * RF1: Requiere user_id + vehicle_id (clave compuesta).
 */
export class CreateAsignacionDto {
    @ApiProperty({
        description: 'ID del propietario (UUID del microservicio de Usuarios)',
        example: 'a3f1b2c4-1234-4abc-89de-1234567890ab',
    })
    @IsUUID()
    @IsNotEmpty()
    userId: string;

    @ApiProperty({
        description: 'ID del vehículo (UUID del microservicio de Vehículos)',
        example: 'b4e2c3d5-5678-4def-90ef-234567890bcd',
    })
    @IsUUID()
    @IsNotEmpty()
    vehicleId: string;

    @ApiPropertyOptional({
        description: 'Descripción adicional sobre la asignación',
        example: 'Vehículo asignado para estacionamiento zona norte',
    })
    @IsOptional()
    @IsString({ message: 'La descripción debe ser un texto válido' })
    @MaxLength(500, { message: 'La descripción no puede exceder los 500 caracteres' })
    descripcion?: string;
}
