import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateVehiculoDto } from '../dto/create-vehiculo.dto';
import { Vehiculo } from '../entities/vehiculo.entity';
import { FactoryVehiculos } from '../factory/factory-vehiculo';

@Injectable()
export class VehiculosService {
    constructor(
        @InjectRepository(Vehiculo)
        private repositoryVehiculo: Repository<Vehiculo>,
    ) { }

    async create(createVehiculoDto: CreateVehiculoDto): Promise<Vehiculo> {
        const existe = await this.repositoryVehiculo.findOne({
            where: {
                placa: createVehiculoDto.datos.placa,
            },
        });

        if (existe) {
            throw new BadRequestException(`El vehiculo con placa ${createVehiculoDto.datos.placa} ya existe`);
        }

        const vehiculo = FactoryVehiculos.crear(createVehiculoDto);
        return this.repositoryVehiculo.save(vehiculo);
    }

    async findAll(): Promise<Vehiculo[]> {
        return this.repositoryVehiculo.find();
    }

    async findOne(id: string): Promise<Vehiculo> {
        const vehiculo = await this.repositoryVehiculo.findOne({ where: { id } });
        if (!vehiculo) {
            throw new NotFoundException(`Vehiculo con ID ${id} no encontrado`);
        }
        return vehiculo;
    }

    async update(id: string, updateData: any): Promise<Vehiculo> {
        //q exista el vehiculo, no se puede cambiar la placa
        const vehiculo = await this.findOne(id);
        // Para simplificar, asumimos que updateData tiene los campos a modificar
        Object.assign(vehiculo, updateData);
        return this.repositoryVehiculo.save(vehiculo);
    }

    async remove(id: string): Promise<void> {
        const vehiculo = await this.findOne(id);
        await this.repositoryVehiculo.remove(vehiculo);
    }
}