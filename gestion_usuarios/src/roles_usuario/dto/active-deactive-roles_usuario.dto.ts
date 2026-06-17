import { PartialType } from '@nestjs/mapped-types';
import { CreateRolesUsuarioDto } from './create-roles_usuario.dto';

export class ActiveDeactiveRolesUsuarioDto extends PartialType(CreateRolesUsuarioDto) {
}
