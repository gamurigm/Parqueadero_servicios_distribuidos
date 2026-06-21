// vehiculos.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete, UsePipes } from '@nestjs/common';
import { VehiculosService } from './vehiculos.service';
import { CreateVehiculoDto } from './dto/create-vehiculo.dto';
import { UpdateVehiculoDto } from './dto/update-vehiculo.dto';
import { SanitizePipe } from './utils/SanitizePipe';
import type { UUID } from 'crypto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Vehiculos')
@Controller('vehiculos')
export class VehiculosController {
  constructor(private readonly vehiculosService: VehiculosService) {}

  @Post()
  @UsePipes(new SanitizePipe())
  @ApiOperation({ summary: 'Crear un vehiculo' })
  @ApiResponse({ status: 201, description: 'Vehiculo creado correctamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  create(@Body() createVehiculoDto: CreateVehiculoDto) {
    return this.vehiculosService.create(createVehiculoDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los vehiculos' })
  findAll() {
    return this.vehiculosService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener vehículo por ID' })
  findOne(@Param('id') id: UUID) {
    return this.vehiculosService.findOne(id);
  }

  @Patch(':id')
  @UsePipes(new SanitizePipe())
  @ApiOperation({ summary: 'Actualizar vehículo' })
  update(@Param('id') id: UUID, @Body() updateVehiculoDto: UpdateVehiculoDto) {
    return this.vehiculosService.update(id, updateVehiculoDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar vehículo' })
  remove(@Param('id') id: UUID) {
    return this.vehiculosService.remove(id);
  }
}