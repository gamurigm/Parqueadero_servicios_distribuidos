import { Controller, Get, Post, Body, Patch, Param, Delete, Put, UseGuards, Req, Headers } from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { Resource } from '../opa/decorators/resource.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('roles')
@Controller('roles')
@UseGuards(JwtAuthGuard) 
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  @ApiBearerAuth('JWT-auth')
  @Resource('roles.create')
  @ApiOperation({ summary: 'Crear un nuevo rol' })
  @ApiResponse({ status: 201, description: 'Rol creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  create(@Body() createRoleDto: CreateRoleDto, @Req() req: any, @Headers('x-mac-address') mac?: string) {
    const ip = req.ip || req.socket?.remoteAddress || '0.0.0.0';
    const username = req.user?.username;
    return this.rolesService.create(createRoleDto, ip, mac, username);
  }

  @Get()
  @ApiBearerAuth('JWT-auth')
  @Resource('roles.read')
  @ApiOperation({ summary: 'Obtener todos los roles' })
  @ApiResponse({ status: 200, description: 'Lista de roles obtenida exitosamente' })
  findAll() {
    return this.rolesService.findAll();
  }

  @Get(':id')
  @ApiBearerAuth('JWT-auth')
  @Resource('roles.read')
  @ApiOperation({ summary: 'Obtener un rol por ID' })
  @ApiParam({ name: 'id', description: 'ID del rol', example: '550e8400-e29b-41d4-a716-446655440000' })
  @ApiResponse({ status: 200, description: 'Rol encontrado' })
  @ApiResponse({ status: 404, description: 'Rol no encontrado' })
  findOne(@Param('id') id: string) {
    return this.rolesService.findOne(id);
  }

  @Put(':id')
  @ApiBearerAuth('JWT-auth')
  @Resource('roles.update')
  @ApiOperation({ summary: 'Actualizar un rol' })
  @ApiParam({ name: 'id', description: 'ID del rol a actualizar' })
  @ApiResponse({ status: 200, description: 'Rol actualizado exitosamente' })
  @ApiResponse({ status: 404, description: 'Rol no encontrado' })
  update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto, @Req() req: any, @Headers('x-mac-address') mac?: string) {
    const ip = req.ip || req.socket?.remoteAddress || '0.0.0.0';
    const username = req.user?.username;
    return this.rolesService.update(id, updateRoleDto, ip, mac, username);
  }

  @Patch(':id')
  @ApiBearerAuth('JWT-auth')
  @Resource('roles.activate')
  @ApiOperation({ summary: 'Activar o desactivar un rol' })
  @ApiParam({ name: 'id', description: 'ID del rol' })
  @ApiResponse({ status: 200, description: 'Estado del rol actualizado' })
  @ApiResponse({ status: 404, description: 'Rol no encontrado' })
  activarDesactivar(@Param('id') id: string, @Req() req: any, @Headers('x-mac-address') mac?: string) {
    const ip = req.ip || req.socket?.remoteAddress || '0.0.0.0';
    const username = req.user?.username;
    return this.rolesService.activarDesactivar(id, ip, mac, username);
  }

  @Delete(':id')
  @ApiBearerAuth('JWT-auth')
  @Resource('roles.delete')
  @ApiOperation({ summary: 'Eliminar un rol' })
  @ApiParam({ name: 'id', description: 'ID del rol a eliminar' })
  @ApiResponse({ status: 200, description: 'Rol eliminado exitosamente' })
  @ApiResponse({ status: 404, description: 'Rol no encontrado' })
  remove(@Param('id') id: string, @Req() req: any, @Headers('x-mac-address') mac?: string) {
    const ip = req.ip || req.socket?.remoteAddress || '0.0.0.0';
    const username = req.user?.username;
    return this.rolesService.remove(id, ip, mac, username);
  }
}