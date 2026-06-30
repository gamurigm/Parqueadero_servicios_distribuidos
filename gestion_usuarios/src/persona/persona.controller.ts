import { Controller, Get, Post, Body, Patch, Param, Delete, Put } from '@nestjs/common';
import { PersonaService } from './persona.service';
import { CreatePersonaDto } from './dto/create-persona.dto';
import { UpdatePersonaDto } from './dto/update-persona.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { Resource } from '../opa/decorators/resource.decorator';

@ApiTags('persona')
@Controller('persona')
export class PersonaController {
  constructor(private readonly personaService: PersonaService) {}

  @Post()
  @ApiBearerAuth('JWT-auth')
  @Resource('personas.create')
  @ApiOperation({ summary: 'Crear una nueva persona' })
  @ApiResponse({ status: 201, description: 'Persona creada exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  create(@Body() createPersonaDto: CreatePersonaDto) {
    return this.personaService.create(createPersonaDto);
  }

  @Get()
  @ApiBearerAuth('JWT-auth')
  @Resource('personas.read')
  @ApiOperation({ summary: 'Obtener todas las personas' })
  @ApiResponse({ status: 200, description: 'Lista de personas obtenida exitosamente' })
  findAll() {
    return this.personaService.findAll();
  }

  @Get('/:id')
  @ApiBearerAuth('JWT-auth')
  @Resource('personas.read')
  @ApiOperation({ summary: 'Obtener una persona por ID' })
  @ApiParam({ name: 'id', description: 'ID de la persona', example: '550e8400-e29b-41d4-a716-446655440000' })
  @ApiResponse({ status: 200, description: 'Persona encontrada' })
  @ApiResponse({ status: 404, description: 'Persona no encontrada' })
  findOne(@Param('id') id: string) {
    return this.personaService.findOne(id);
  }

  @Put('/:id')
  @ApiBearerAuth('JWT-auth')
  @Resource('personas.update')
  @ApiOperation({ summary: 'Actualizar una persona' })
  @ApiParam({ name: 'id', description: 'ID de la persona a actualizar' })
  @ApiResponse({ status: 200, description: 'Persona actualizada exitosamente' })
  @ApiResponse({ status: 404, description: 'Persona no encontrada' })
  update(@Param('id') id: string, @Body() updatePersonaDto: UpdatePersonaDto) {
    return this.personaService.update(id, updatePersonaDto);
  }

  @Patch('/:id/cambio-de-estado')
  @ApiBearerAuth('JWT-auth')
  @Resource('personas.activate')
  @ApiOperation({ summary: 'Cambiar estado de una persona (activar/desactivar)' })
  @ApiParam({ name: 'id', description: 'ID de la persona' })
  @ApiResponse({ status: 200, description: 'Estado de la persona actualizado' })
  @ApiResponse({ status: 404, description: 'Persona no encontrada' })
  cambioDeEstado(@Param('id') id: string) {
    return this.personaService.cambioDeEstado(id);
  }

  @Delete('/:id')
  @ApiBearerAuth('JWT-auth')
  @Resource('personas.delete')
  @ApiOperation({ summary: 'Eliminar una persona' })
  @ApiParam({ name: 'id', description: 'ID de la persona a eliminar' })
  @ApiResponse({ status: 200, description: 'Persona eliminada exitosamente' })
  @ApiResponse({ status: 404, description: 'Persona no encontrada' })
  remove(@Param('id') id: string) {
    return this.personaService.remove(id);
  }
}