import { Controller, Get, Post, Body, Patch, Param, Delete, Put } from '@nestjs/common';
import { RolesUsuarioService } from './roles_usuario.service';
import { CreateRolesUsuarioDto } from './dto/create-roles_usuario.dto';
import { UpdateRolesUsuarioDto } from './dto/update-roles_usuario.dto';
import { ActiveDeactiveRolesUsuarioDto } from './dto/active-deactive-roles_usuario.dto';

@Controller('roles-Usuario')
export class RolesUsuarioController {
  constructor(private readonly rolesUsuarioService: RolesUsuarioService) {}

  @Post()
  create(@Body() createRolesUsuarioDto: CreateRolesUsuarioDto) {
    return this.rolesUsuarioService.create(createRolesUsuarioDto);
  }

  @Get()
  findAll() {
    return this.rolesUsuarioService.findAll();
  }

  @Get('/asignacion')
  findOne(@Body() updateRolesUsuarioDto: UpdateRolesUsuarioDto) {
    return this.rolesUsuarioService.findOne(updateRolesUsuarioDto);
  }

  @Get('roles/:id_rol')
  findUsersByRol(@Param('id_rol') id_rol : string) {
    return this.rolesUsuarioService.findUsersByRoles(id_rol);
  }

  @Get('usuarios/:id_user')
  findRolesByUser(@Param('id_user') id_user : string) {
    return this.rolesUsuarioService.findRolesByUser(id_user);
  }

  @Put()
  update(@Body() updateRolesUsuarioDto: UpdateRolesUsuarioDto) {
    return this.rolesUsuarioService.update(updateRolesUsuarioDto);
  }

  @Patch("activar-desactivar")
  active_deactive(@Body() activeDeactiveRolesUsuarioDTO : ActiveDeactiveRolesUsuarioDto) {
    return this.rolesUsuarioService.activarDesactivar(activeDeactiveRolesUsuarioDTO);
  }

  @Delete()
  remove(@Body() updateRolesUsuarioDto: UpdateRolesUsuarioDto) {
    return this.rolesUsuarioService.remove(updateRolesUsuarioDto);
  }
}
