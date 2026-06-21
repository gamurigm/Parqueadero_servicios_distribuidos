import { IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';

export class CreateRoleDto {
    @IsString()
    @IsNotEmpty()
    @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
    @MaxLength(50, { message: 'El nombre no puede exceder 50 caracteres' })
    @ApiProperty({
        example: 'Administrador',
        description: 'Nombre del rol',
        minLength: 2,
        maxLength: 50
    })
    nombre!: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        example: 'Rol con acceso total al sistema',
        description: 'Descripción del rol'
    })
    descripcion!: string;
}