import { PartialType } from '@nestjs/mapped-types';
import { CreateRolesUsuarioDto } from './create-roles_usuario.dto';
import { Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export class UpdateRolesUsuarioDto extends PartialType(CreateRolesUsuarioDto) {
    @Matches(UUID_REGEX, { message: 'id_nuevo_rol debe ser un UUID válido' })
    @ApiProperty({
        example: '550e8400-e29b-41d4-a716-446655440002',
        description: 'Nuevo ID del rol a asignar'
    })
    id_nuevo_rol!: string;
}