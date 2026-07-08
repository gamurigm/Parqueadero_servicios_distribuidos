// vehiculos.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete, UsePipes, Put, UseGuards, Headers } from '@nestjs/common';
import { VehiculosService } from './vehiculos.service';
import { CreateVehiculoDto } from './dto/create-vehiculo.dto';
import { UpdateVehiculoDto } from './dto/update-vehiculo.dto';
import { SanitizePipe } from './utils/SanitizePipe';
import type { UUID } from 'crypto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Resource } from '../opa/decorators/resource.decorator';

@ApiTags('Vehiculos')
@ApiBearerAuth('access-token')
@Controller('vehiculos')
@UseGuards(JwtAuthGuard) 
export class VehiculosController {
  constructor(private readonly vehiculosService: VehiculosService) {}

  @Post()
  @UsePipes(new SanitizePipe())
  @Resource('vehiculos.create')
  @ApiOperation({ summary: 'Crear un vehiculo' })
  @ApiResponse({ status: 201, description: 'Vehiculo creado correctamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  create(@Body() createVehiculoDto: CreateVehiculoDto) {
    return this.vehiculosService.create(createVehiculoDto);
  }

  @Get()
  @Resource('vehiculos.read')
  @ApiOperation({ summary: 'Obtener todos los vehiculos' })
  findAll() {
    return this.vehiculosService.findAll();
  }

  @Get(':id')
  @Resource('vehiculos.read')
  @ApiOperation({ summary: 'Obtener vehículo por ID' })
  findOne(@Param('id') id: UUID) {
    return this.vehiculosService.findOne(id);
  }

  @Put(':id')
  @UsePipes(new SanitizePipe())
  @Resource('vehiculos.update')
  @ApiOperation({ summary: 'Actualizar vehículo' })
  update(@Param('id') id: UUID, @Body() updateVehiculoDto: UpdateVehiculoDto) {
    return this.vehiculosService.update(id, updateVehiculoDto);
  }

  //Define el endpoint HTTP DELETE /vehiculos/:id.
  @Delete(':id')
  @Resource('vehiculos.delete')
  @ApiOperation({ summary: 'Eliminar vehículo' })

  //Recibe el id del vehículo y también el header authorization de la petición.
  remove(@Param('id') id: UUID, @Headers('authorization') authHeader?: string) {
    return this.vehiculosService.remove(id, authHeader);
  }
}
