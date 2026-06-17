import { PartialType } from '@nestjs/mapped-types';
import { CreateRolesUsuarioDto } from './create-roles_usuario.dto';
import { IsUUID } from 'class-validator';

export class UpdateRolesUsuarioDto extends PartialType(CreateRolesUsuarioDto) {
    @IsUUID()
    id_nuevo_rol!: string;
}
