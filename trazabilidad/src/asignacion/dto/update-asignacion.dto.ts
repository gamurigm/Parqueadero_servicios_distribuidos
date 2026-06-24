import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

/**
 * DTO para actualizar una asignación existente.
 * Solo se puede modificar el estado y las descripcion (la clave compuesta es inmutable).
 */
export class UpdateAsignacionDto {
    @ApiPropertyOptional({
        description: 'Estado de la asignación: 1=activo, 0=inactivo',
        example: 0,
        minimum: 0,
        maximum: 1,
    })
    @IsOptional()
    @IsInt()
    @Min(0)
    @Max(1)
    estado?: number;

    @ApiPropertyOptional({
        description: 'Descripcion adicionales sobre la asignación',
        example: 'Asignación suspendida temporalmente',
    })
    @IsOptional()
    @IsString()
    descripcion?: string;
}
