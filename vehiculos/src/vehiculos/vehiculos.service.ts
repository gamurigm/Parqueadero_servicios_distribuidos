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
    
    // Buscar el vehículo existente
    const vehiculoExistente = await this.vehiculoRepository.findOne({
      where: { id: idSanitizado }
    });

    if (!vehiculoExistente) {
      throw new NotFoundException('Vehículo no encontrado');
    }

    try {
      // Si se está actualizando la placa, verificar que no exista duplicado
      if (updateVehiculoDto.datos?.placa) {
        const placaSanitizada = this.utils.sanitizeString('placa', updateVehiculoDto.datos.placa);
        const existe = await this.vehiculoRepository.findOne({
          where: { placa: placaSanitizada }
        });

        if (existe && existe.id !== idSanitizado) {
          throw new BadRequestException('Ya existe un vehículo con esta placa');
        }
      }

      // Actualizar el vehículo usando el factory
      const vehiculoActualizado = FactoryVehiculos.actualizar(
        updateVehiculoDto,
        vehiculoExistente
      );

      // Guardar los cambios
      const saved = await this.vehiculoRepository.save(vehiculoActualizado);
      return saved;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Error al actualizar el vehículo' );
    }
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