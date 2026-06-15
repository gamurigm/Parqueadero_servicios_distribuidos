import { Injectable } from '@nestjs/common';
import { CreateVehiculoDto } from './dto/create-vehiculo.dto';
import { UpdateVehiculoDto } from './dto/update-vehiculo.dto';
import { Repository } from 'typeorm';
import { Clasificacion, Vehiculo } from './entities/vehiculo.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { FactoryVehiculos } from './factory/factory-vehiculos';
import { ListCollectionsCursor } from 'typeorm/driver/mongodb/typings.js';
import { UUID } from 'crypto';
import { TipoMoto } from './entities/tipos/motocicleta.entity';

@Injectable()
export class VehiculosService {

  constructor(
    @InjectRepository(Vehiculo)
    private repositoryVehiculos: Repository<Vehiculo>,
  ) {}

  async create(createVehiculoDto: CreateVehiculoDto): Promise<Vehiculo> {
    const existe = await this.repositoryVehiculos.findOne({
      where: { 
        placa: createVehiculoDto.datos.placa,
      },
    });

      if (existe) throw new Error('Vehículo ya existe con esta placa');

      const vehiculo = FactoryVehiculos.crear(createVehiculoDto);

      return this.repositoryVehiculos.save(vehiculo);

  }

  async findAll(): Promise<Vehiculo[]> {
    return this.repositoryVehiculos.find()
  }

  async findOne(id: UUID): Promise<Vehiculo> {
    const existe = await this.repositoryVehiculos.findOne({
      where: { 
        id,      
      },
    });

    if (!existe) throw new Error('Vehículo no encontrado');
    

    return existe;
  }

  async update(id: UUID, updateVehiculoDto: UpdateVehiculoDto): Promise<Vehiculo> {
    const existe = await this.repositoryVehiculos.findOne({
      where: { 
        id,      
      },
    });

    if (!existe) throw new Error('Vehículo no encontrado');

    const placaExiste = await this.repositoryVehiculos.findOne({  
      where: {
        placa: updateVehiculoDto.datos?.placa,
      },
    });

    if (updateVehiculoDto.datos?.placa) {
      const placaExiste = await this.repositoryVehiculos.findOne({
        where: {
          placa: updateVehiculoDto.datos.placa,
        },
      });

      if (placaExiste && placaExiste.id !== id) {
        throw new Error('Otro vehículo ya existe con esta placa');
      }
    }

    
    if (!updateVehiculoDto.datos || Object.keys(updateVehiculoDto.datos).length === 0) {
      throw new Error('Realice al menos un cambio en los datos del vehículo');
    }
    
    const datosActualizar: any = { ...updateVehiculoDto.datos };
    
    if (datosActualizar.clasificacion) {
      datosActualizar.clasificacion = datosActualizar.clasificacion as Clasificacion;
    }

    if (datosActualizar.tipo) {
      datosActualizar.tipoMoto = datosActualizar.tipo as TipoMoto;
      delete datosActualizar.tipo; 
    }
    
    await this.repositoryVehiculos.update(id,datosActualizar);
    
    return this.findOne(id);
  }
  
  async remove(id: UUID) {
    const existe = await this.repositoryVehiculos.findOne({
      where: { 
        id,      
      },
    });

    if (!existe) throw new Error('Vehículo no encontrado');

    await this.repositoryVehiculos.delete(id);

    return { message: 'Vehículo eliminado exitosamente' };
  }
}
