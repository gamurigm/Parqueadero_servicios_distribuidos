import { Injectable } from '@nestjs/common';
import { CreateRolesPersonaDto } from './dto/create-roles_persona.dto';
import { UpdateRolesPersonaDto } from './dto/update-roles_persona.dto';

@Injectable()
export class RolesPersonaService {
  create(createRolesPersonaDto: CreateRolesPersonaDto) {
    return 'This action adds a new rolesPersona';
  }

  findAll() {
    return `This action returns all rolesPersona`;
  }

  findOne(id: number) {
    return `This action returns a #${id} rolesPersona`;
  }

  update(id: number, updateRolesPersonaDto: UpdateRolesPersonaDto) {
    return `This action updates a #${id} rolesPersona`;
  }

  remove(id: number) {
    return `This action removes a #${id} rolesPersona`;
  }
}
