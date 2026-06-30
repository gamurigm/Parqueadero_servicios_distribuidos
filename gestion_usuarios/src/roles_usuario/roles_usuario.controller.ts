import { Controller, Get, Post, Body, Patch, Param, Delete, Put } from '@nestjs/common';
import { RolesUsuarioService } from './roles_usuario.service';
import { CreateRolesUsuarioDto } from './dto/create-roles_usuario.dto';
import { UpdateRolesUsuarioDto } from './dto/update-roles_usuario.dto';
import { ActiveDeactiveRolesUsuarioDto } from './dto/active-deactive-roles_usuario.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { Resource } from '../opa/decorators/resource.decorator';

@ApiTags('roles-usuario')
@Controller('roles-Usuario')
export class RolesUsuarioController {
  constructor(private readonly rolesUsuarioService: RolesUsuarioService) {}

  @Post()
  @ApiBearerAuth('JWT-auth')
  @Resource('roles-usuario.create')
  @ApiOperation({ summary: 'Asignar un rol a un usuario' })
  @ApiResponse({ status: 201, description: 'Rol asignado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  create(@Body() createRolesUsuarioDto: CreateRolesUsuarioDto) {
    return this.rolesUsuarioService.create(createRolesUsuarioDto);
  }

  @Get()
  @ApiBearerAuth('JWT-auth')
  @Resource('roles-usuario.read')
  @ApiOperation({ summary: 'Obtener todas las asignaciones de roles' })
  @ApiResponse({ status: 200, description: 'Lista de asignaciones obtenida exitosamente' })
  findAll() {
    return this.rolesUsuarioService.findAll();
  }

  @Get('/asignacion')
  @ApiBearerAuth('JWT-auth')
  @Resource('roles-usuario.read')
  @ApiOperation({ summary: 'Obtener una asignación específica por usuario y rol' })
  @ApiResponse({ status: 200, description: 'Asignación encontrada' })
  @ApiResponse({ status: 404, description: 'Asignación no encontrada' })
  findOne(@Body() updateRolesUsuarioDto: UpdateRolesUsuarioDto) {
    return this.rolesUsuarioService.findOne(updateRolesUsuarioDto);
  }

  @Get('roles/:id_rol')
  @ApiBearerAuth('JWT-auth')
  @Resource('roles-usuario.read')
  @ApiOperation({ summary: 'Obtener todos los usuarios con un rol específico' })
  @ApiParam({ name: 'id_rol', description: 'ID del rol', example: '550e8400-e29b-41d4-a716-446655440000' })
  @ApiResponse({ status: 200, description: 'Lista de usuarios obtenida exitosamente' })
  findUsersByRol(@Param('id_rol') id_rol: string) {
    return this.rolesUsuarioService.findUsersByRoles(id_rol);
  }

  @Get('usuarios/:id_user')
  @ApiBearerAuth('JWT-auth')
  @Resource('roles-usuario.read')
  @ApiOperation({ summary: 'Obtener todos los roles de un usuario específico' })
  @ApiParam({ name: 'id_user', description: 'ID del usuario', example: '550e8400-e29b-41d4-a716-446655440000' })
  @ApiResponse({ status: 200, description: 'Lista de roles obtenida exitosamente' })
  findRolesByUser(@Param('id_user') id_user: string) {
    return this.rolesUsuarioService.findRolesByUser(id_user);
  }

  @Put()
  @ApiBearerAuth('JWT-auth')
  @Resource('roles-usuario.update')
  @ApiOperation({ summary: 'Actualizar el rol de un usuario' })
  @ApiResponse({ status: 200, description: 'Rol actualizado exitosamente' })
  @ApiResponse({ status: 404, description: 'Asignación no encontrada' })
  update(@Body() updateRolesUsuarioDto: UpdateRolesUsuarioDto) {
    return this.rolesUsuarioService.update(updateRolesUsuarioDto);
  }

  @Patch("activar-desactivar")
  @ApiBearerAuth('JWT-auth')
  @Resource('roles-usuario.activate')
  @ApiOperation({ summary: 'Activar o desactivar una asignación de rol' })
  @ApiResponse({ status: 200, description: 'Estado de la asignación actualizado' })
  @ApiResponse({ status: 404, description: 'Asignación no encontrada' })
  active_deactive(@Body() activeDeactiveRolesUsuarioDTO: ActiveDeactiveRolesUsuarioDto) {
    return this.rolesUsuarioService.activarDesactivar(activeDeactiveRolesUsuarioDTO);
  }

  @Delete()
  @ApiBearerAuth('JWT-auth')
  @Resource('roles-usuario.delete')
  @ApiOperation({ summary: 'Eliminar una asignación de rol' })
  @ApiResponse({ status: 200, description: 'Asignación eliminada exitosamente' })
  @ApiResponse({ status: 404, description: 'Asignación no encontrada' })
  remove(@Body() updateRolesUsuarioDto: UpdateRolesUsuarioDto) {
    return this.rolesUsuarioService.remove(updateRolesUsuarioDto);
  }
}