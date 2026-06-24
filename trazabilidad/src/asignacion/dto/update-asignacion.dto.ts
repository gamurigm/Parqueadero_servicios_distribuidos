import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

/**
 * DTO para actualizar una asignación existente.
 * Solo se puede modificar el estado y las notas (la clave compuesta es inmutable).
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
        description: 'Notas adicionales sobre la asignación',
        example: 'Asignación suspendida temporalmente',
    })
    @IsOptional()
    @IsString({ message: 'Las notas deben ser un texto válido' })
    @MaxLength(500, { message: 'Las notas no pueden exceder los 500 caracteres' })
    notas?: string;
}
