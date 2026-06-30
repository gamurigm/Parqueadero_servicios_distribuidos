import { Controller, Get, Post, Body, Patch, Param, Delete, Put } from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Resource } from '../opa/decorators/resource.decorator';

@ApiTags('usuarios')
@Controller('usuario')
export class UsuarioController {
  constructor(private readonly usuarioService: UsuarioService) {}

  @Post()
  @ApiBearerAuth('JWT-auth')
  @Resource('usuarios.create')
  @ApiOperation({ 
    summary: 'Crear un nuevo usuario',
    description: 'Crea un usuario con username y password'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Usuario creado exitosamente' 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Datos inválidos (username duplicado, password muy corta)' 
  })
  create(@Body() createUsuarioDto: CreateUsuarioDto) {
    return this.usuarioService.create(createUsuarioDto);
  }

  @Get()
  @ApiBearerAuth('JWT-auth')
  @Resource('usuarios.read')
  @ApiOperation({ 
    summary: 'Obtener todos los usuarios',
    description: 'Retorna la lista de todos los usuarios registrados'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de usuarios obtenida exitosamente' 
  })
  findAll() {
    return this.usuarioService.findAll();
  }

  @Get('/:id')
  @ApiBearerAuth('JWT-auth')
  @Resource('usuarios.read')
  @ApiOperation({ 
    summary: 'Obtener un usuario por ID',
    description: 'Retorna los detalles de un usuario específico'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'ID del usuario', 
    example: '550e8400-e29b-41d4-a716-446655440000' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Usuario encontrado' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Usuario no encontrado' 
  })
  findOne(@Param('id') id: string) {
    return this.usuarioService.findOne(id);
  }

  @Put('/:id')
  @ApiBearerAuth('JWT-auth')
  @Resource('usuarios.update')
  @ApiOperation({ 
    summary: 'Actualizar usuario',
    description: 'Actualiza los datos de un usuario existente'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'ID del usuario a actualizar' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Usuario actualizado exitosamente' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Usuario no encontrado' 
  })
  updateUser(@Param('id') id: string, @Body() updateUsuarioDto: UpdateUsuarioDto) {
    return this.usuarioService.update(id, updateUsuarioDto);
  }

  @Patch('/:id')
  @ApiBearerAuth('JWT-auth')
  @Resource('usuarios.update')
  @ApiOperation({ 
    summary: 'Actualizar contraseña del usuario',
    description: 'Cambia la contraseña de un usuario específico'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'ID del usuario' 
  })
  @ApiBody({ 
    type: UpdateUsuarioDto,
    description: 'Nueva contraseña del usuario'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Contraseña actualizada exitosamente' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Usuario no encontrado' 
  })
  updatePassword(
    @Param('id') id: string,
    @Body() newpassword:string 
  ) {
    return this.usuarioService.updatePassword(id, newpassword);
  }

  @Patch('/:id/activar-desactivar')
  @ApiBearerAuth('JWT-auth')
  @Resource('usuarios.activate')
  @ApiOperation({ 
    summary: 'Activar o desactivar usuario',
    description: 'Cambia el estado activo/inactivo de un usuario'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'ID del usuario' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Estado del usuario actualizado' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Usuario no encontrado' 
  })
  activarDesactivar(@Param('id') id: string) {
    return this.usuarioService.activarDesactivar(id);
  }

  @Delete('/:id')
  @ApiBearerAuth('JWT-auth')
  @Resource('usuarios.delete')
  @ApiOperation({ 
    summary: 'Eliminar usuario',
    description: 'Elimina un usuario de la base de datos'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'ID del usuario a eliminar' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Usuario eliminado exitosamente' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Usuario no encontrado' 
  })
  remove(@Param('id') id: string) {
    return this.usuarioService.remove(id);
  }
}