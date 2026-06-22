// vehiculos.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vehiculo } from './entities/vehiculo.entity';
import { CreateVehiculoDto } from './dto/create-vehiculo.dto';
import { UpdateVehiculoDto } from './dto/update-vehiculo.dto';
import { FactoryVehiculos } from './factory/factory-vehiculos';
import { Utils } from './utils/utils';
import type { UUID } from 'crypto';

@Injectable()
export class VehiculosService {
  private utils = new Utils();

  constructor(
    @InjectRepository(Vehiculo)
    private vehiculoRepository: Repository<Vehiculo>,
  ) {}

  async create(createVehiculoDto: CreateVehiculoDto) {
    try {
      // Validar que no exista una placa duplicada
      const placaSanitizada = this.utils.sanitizeString('placa', createVehiculoDto.datos.placa);
      const existe = await this.vehiculoRepository.findOne({
        where: { placa: placaSanitizada }
      });

      if (existe) {
        throw new BadRequestException('Ya existe un vehículo con esta placa');
      }

   // Crear el vehículo usando el factory con sanitización
      const vehiculo = FactoryVehiculos.crear(createVehiculoDto);
      
      // Guardar en la base de datos
      const saved = await this.vehiculoRepository.save(vehiculo);
      return saved;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Error al crear el vehículo: ');
    }
  }

  async findAll() {
    return await this.vehiculoRepository.find();
  }

  async findOne(id: UUID) {
    const idSanitizado = this.utils.validateUUID(id as string);
    const vehiculo = await this.vehiculoRepository.findOne({
      where: { id: idSanitizado }
    });

    if (!vehiculo) {
      throw new NotFoundException('Vehículo no encontrado');
    }

    return vehiculo;
  }

async update(id: UUID, updateVehiculoDto: UpdateVehiculoDto) {
  const idSanitizado = this.utils.validateUUID(id as string);
  
  const vehiculoExistente = await this.vehiculoRepository.findOne({
    where: { id: idSanitizado }
  });

  if (!vehiculoExistente) throw new NotFoundException('Vehículo no encontrado');
  

  try {
    if (!updateVehiculoDto.datos || Object.keys(updateVehiculoDto.datos).length === 0) {
      throw new BadRequestException('No se enviaron datos para actualizar');
    }

    if (updateVehiculoDto.datos?.placa) {
      const placaSanitizada = this.utils.sanitizeString('placa', updateVehiculoDto.datos.placa);
      const existe = await this.vehiculoRepository.findOne({
        where: { placa: placaSanitizada }
      });

      if (existe && existe.id !== idSanitizado) throw new BadRequestException('Ya existe un vehículo con esta placa');
    }

    const datosSanitizados = FactoryVehiculos.sanitizarDatos(updateVehiculoDto.datos);
    const hayCambios = this.hayCambios(vehiculoExistente, datosSanitizados);
    
    if (!hayCambios) {
      return {
        message: 'No se realizaron cambios porque los datos son idénticos',
        vehiculo: vehiculoExistente
      };
    }

    const vehiculoActualizado = FactoryVehiculos.actualizar(
      { datos: datosSanitizados }, 
      vehiculoExistente
    );

    const saved = await this.vehiculoRepository.save(vehiculoActualizado);
    return {
      message: 'Vehículo actualizado correctamente',
      vehiculo: saved
    };
  } catch (error) {
    if (error instanceof BadRequestException)
    throw new BadRequestException('Error al actualizar el vehículo' );
  }
}

private hayCambios(vehiculoExistente: Vehiculo, nuevosDatosSanitizados: any): boolean {
  const datosExistentes: any = {
    placa: vehiculoExistente.placa,
    marca: vehiculoExistente.marca,
    modelo: vehiculoExistente.modelo,
    color: vehiculoExistente.color,
    anio: vehiculoExistente.anio,
    clasificacion: vehiculoExistente.clasificacion,
  };

  if ('numeroPuertas' in vehiculoExistente) {
    datosExistentes.numeroPuertas = (vehiculoExistente as any).numeroPuertas;
  }
  if ('capacidadMaletero' in vehiculoExistente) {
    datosExistentes.capacidadMaletero = (vehiculoExistente as any).capacidadMaletero;
  }
  if ('cabina' in vehiculoExistente) {
    datosExistentes.cabina = (vehiculoExistente as any).cabina;
  }
  if ('capacidadCarga' in vehiculoExistente) {
    datosExistentes.capacidadCarga = (vehiculoExistente as any).capacidadCarga;
  }
  if ('tipoMoto' in vehiculoExistente) {
    datosExistentes.tipoMoto = (vehiculoExistente as any).tipoMoto;
  }

  for (const key of Object.keys(nuevosDatosSanitizados)) {
    if (key in datosExistentes) {
      const valorNuevo = nuevosDatosSanitizados[key];
      const valorExistente = datosExistentes[key];
      //cambio existe
      if (valorNuevo !== valorExistente) {
        return true;
      }
    }
  }
  //cambio no existe
  return false;
}

  async remove(id: UUID) {
    const idSanitizado = this.utils.validateUUID(id as string);
    
    const vehiculo = await this.vehiculoRepository.findOne({
      where: { id: idSanitizado }
    });

    if (!vehiculo) {
      throw new NotFoundException('Vehículo no encontrado');
    }

    await this.vehiculoRepository.remove(vehiculo);
    return { message: 'Vehículo eliminado correctamente' };
  }
}