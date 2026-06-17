import { PartialType } from '@nestjs/mapped-types';
import { CreateRolesUsuarioDto } from './create-roles_usuario.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateRolesUsuarioDto extends PartialType(CreateRolesUsuarioDto) {
}
