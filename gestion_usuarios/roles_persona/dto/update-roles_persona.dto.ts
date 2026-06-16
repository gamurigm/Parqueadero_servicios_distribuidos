import { PartialType } from '@nestjs/mapped-types';
import { CreateRolesPersonaDto } from './create-roles_persona.dto';

export class UpdateRolesPersonaDto extends PartialType(CreateRolesPersonaDto) {}
