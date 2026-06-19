import { Controller, Get, Post, Body, Patch, Param, Delete, Put } from '@nestjs/common';
import { PersonaService } from './persona.service';
import { CreatePersonaDto } from './dto/create-persona.dto';
import { UpdatePersonaDto } from './dto/update-persona.dto';

@Controller('persona')
export class PersonaController {
  constructor(private readonly personaService: PersonaService) {}

  @Post()
  create(@Body() createPersonaDto: CreatePersonaDto) {
    return this.personaService.create(createPersonaDto);
  }

  @Get()
  findAll() {
    return this.personaService.findAll();
  }

  @Get('/:id')
  findOne(@Param('id') id: string) {
    return this.personaService.findOne(id);
  }

  @Put('/:id')
  update(@Param('id') id: string, @Body() updatePersonaDto: UpdatePersonaDto) {
    return this.personaService.update(id, updatePersonaDto);
  }

  @Patch('/:id/cambio-de-estado')
  cambioDeEstado(@Param('id') id: string) {
    return this.personaService.cambioDeEstado(id);
  }

  @Delete('/:id')
  remove(@Param('id') id: string) {
    return this.personaService.remove(id);
  }
}
