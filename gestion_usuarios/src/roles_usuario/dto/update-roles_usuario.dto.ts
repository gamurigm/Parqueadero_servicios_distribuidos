import { PartialType } from '@nestjs/mapped-types';
import { CreateRolesUsuarioDto } from './create-roles_usuario.dto';
import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateRolesUsuarioDto extends PartialType(CreateRolesUsuarioDto) {
    @IsUUID()
    @ApiProperty({
        example: '550e8400-e29b-41d4-a716-446655440002',
        description: 'Nuevo ID del rol a asignar'
    })
    id_nuevo_rol!: string;
}