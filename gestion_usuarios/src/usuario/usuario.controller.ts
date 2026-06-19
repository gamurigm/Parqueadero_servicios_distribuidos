import { Controller, Get, Post, Body, Patch, Param, Delete, Put } from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';

@Controller('usuario')
export class UsuarioController {
  constructor(private readonly usuarioService: UsuarioService) {}

  @Post()
  create(@Body() createUsuarioDto: CreateUsuarioDto) {
    return this.usuarioService.create(createUsuarioDto);
  }

  @Get()
  findAll() {
    return this.usuarioService.findAll();
  }

  @Get('/:id')
  findOne(@Param('id') id: string) {
    return this.usuarioService.findOne(id);
  }

  @Put('/:id')
  updateUser(@Param('id') id: string, @Body() updateUsuarioDto: UpdateUsuarioDto) {
    return this.usuarioService.update(id, updateUsuarioDto);
  }

  @Patch('/:id')
  updatePassword(@Param('id') id: string,@Body() body: { newpassword: string }){
    return this.usuarioService.updatePassword(id,body.newpassword);
  }

  @Patch('/:id/activar-desactivar')
  activarDesactivar(@Param('id') id: string){
    return this.usuarioService.activarDesactivar(id);
  }

  @Delete('/:id')
  remove(@Param('id') id: string) {
    return this.usuarioService.remove(id);
  }
}
