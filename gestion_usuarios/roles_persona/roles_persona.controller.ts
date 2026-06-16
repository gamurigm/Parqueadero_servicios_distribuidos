import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { RolesPersonaService } from './roles_persona.service';
import { CreateRolesPersonaDto } from './dto/create-roles_persona.dto';
import { UpdateRolesPersonaDto } from './dto/update-roles_persona.dto';

@Controller('roles-persona')
export class RolesPersonaController {
  constructor(private readonly rolesPersonaService: RolesPersonaService) {}

  @Post()
  create(@Body() createRolesPersonaDto: CreateRolesPersonaDto) {
    return this.rolesPersonaService.create(createRolesPersonaDto);
  }

  @Get()
  findAll() {
    return this.rolesPersonaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.rolesPersonaService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRolesPersonaDto: UpdateRolesPersonaDto) {
    return this.rolesPersonaService.update(+id, updateRolesPersonaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.rolesPersonaService.remove(+id);
  }
}
