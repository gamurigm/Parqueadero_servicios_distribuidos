import { IsNotEmpty, IsString, Matches } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export class CreateRolesUsuarioDto {
    @Matches(UUID_REGEX, { message: 'id_user debe ser un UUID válido' })
    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        example: '550e8400-e29b-41d4-a716-446655440000',
        description: 'ID del usuario'
    })
    id_user!: string;

    @Matches(UUID_REGEX, { message: 'id_rol debe ser un UUID válido' })
    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        example: '550e8400-e29b-41d4-a716-446655440001',
        description: 'ID del rol'
    })
    id_rol!: string;
}