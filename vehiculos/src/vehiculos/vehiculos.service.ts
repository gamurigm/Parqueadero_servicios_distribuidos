// vehiculos.service.ts
import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Vehiculo } from './entities/vehiculo.entity';
import { CreateVehiculoDto } from './dto/create-vehiculo.dto';
import { UpdateVehiculoDto } from './dto/update-vehiculo.dto';
import { FactoryVehiculos } from './factory/factory-vehiculos';
import { Utils } from './utils/utils';
import type { UUID } from 'crypto';
import { AuditEvent, EventPublisher } from './event-publisher.service';

@Injectable()
export class VehiculosService {
  private utils = new Utils();

  constructor(
    @InjectRepository(Vehiculo)
    private vehiculoRepository: Repository<Vehiculo>,
    private eventPublisher: EventPublisher,
  ) { }

  // Método auxiliar para publicar eventos
  private async emitEvent(
    accion: string,
    vehiculo: Vehiculo,
    datosExtra?: any,
  ) {
    const event: AuditEvent = {
      servicio: 'vehiculos',
      accion,
      entidad: 'Vehiculo',
      datos: { ...vehiculo, ...datosExtra },
      // usuario e ip se podrían obtener del contexto (request) si se inyecta
    };
    await this.eventPublisher.publish(event);
  }

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

      await this.emitEvent('CREATE', saved);

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
        throw new BadRequestException('Error al actualizar el vehículo');
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

  //Es el metodo que elimina un vehiculo, donde recibe el id y el header authorization
  //para usarlo en validaciones con servicios externos
  async remove(id: UUID, authHeader?: string) {
    const idSanitizado = this.utils.validateUUID(id as string);

    const vehiculo = await this.vehiculoRepository.findOne({
      where: { id: idSanitizado },
    });

    if (!vehiculo) {
      throw new NotFoundException('Vehículo no encontrado');
    }

    //Llama a la validacion de tickets activos. Verifica en el microservicio tickets
    //si la placa del vehiculo tiene algun ticket en estado activo
    await this.assertNoActiveTicket(vehiculo.placa, authHeader);

    //LLama la validacion de las asignaciones en trazabilidad y verifica si el vehiculo
    //con el id tiene una asignacion activa
    await this.assertNoActiveAssignment(vehiculo.id, authHeader);

    await this.vehiculoRepository.remove(vehiculo);
    return { message: 'Vehículo eliminado correctamente' };
  }

  //Inicia una funcion que pregunta a tickets por la existencia de tickets
  //activos parac la placa dada
  private async assertNoActiveTicket(placa: string, authHeader?: string): Promise<void> {
    const ticketsServiceUrl = this.configService.get<string>(
      'TICKETS_SERVICE_URL',
      'http://localhost:3003',
    ).replace(/\/$/, '');

    const url = `${ticketsServiceUrl}/`; // no specific tickets-by-plate endpoint available

    //Construye headers HTTP para enviar el token a tickets
    const headers: Record<string, string> = authHeader ? { Authorization: authHeader } : {};
    try {
      const response = await fetch(url, { method: 'GET', headers });
      if (!response.ok) {
        throw new BadRequestException('No se pudo validar si el vehículo tiene tickets activos');
      }
      const tickets = await response.json();
      if (!Array.isArray(tickets)) {
        return;
      }
      const placaNormalized = String(placa ?? '').trim().toUpperCase();
      const hasActive = tickets.some((ticket: any) =>
        String(ticket?.placa ?? '').trim().toUpperCase() === placaNormalized &&
        String(ticket?.estado ?? '').trim().toUpperCase() === 'ACTIVO',
      );
      if (hasActive) {
        throw new ConflictException(
          'No se puede eliminar el vehículo porque tiene un ticket activo en tickets',
        );
      }
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Error al validar si el vehículo tiene tickets activos');
    }
  }

  //Pregunta a trazabilidad si el vehiculo esta asignado
  private async assertNoActiveAssignment(vehicleId: string, authHeader?: string): Promise<void> {
    const trazabilidadServiceUrl = this.configService.get<string>(
      'TRAZABILIDAD_SERVICE_URL',
      'http://localhost:3002',
    ).replace(/\/$/, '');

    const url = `${trazabilidadServiceUrl}/asignaciones`;

    //Contruye headers HTTP para enviar el token a
    //trazabilidad si existe
    const headers: Record<string, string> = authHeader ? { Authorization: authHeader } : {};
    try {
      const response = await fetch(url, { method: 'GET', headers });
      if (!response.ok) {
        throw new BadRequestException('No se pudo validar si el vehículo está asignado en trazabilidad');
      }
      const assignments = await response.json();
      if (!Array.isArray(assignments)) {
        return;
      }
      const normalizedId = String(vehicleId).trim().toLowerCase();
      const hasActive = assignments.some((assignment: any) =>
        String(assignment?.vehicleId ?? '').trim().toLowerCase() === normalizedId &&
        (assignment?.estado === 1 || String(assignment?.estado ?? '').trim() === '1'),
      );
      if (hasActive) {
        throw new ConflictException(
          'No se puede eliminar el vehículo porque está asignado en trazabilidad',
        );
      }
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Error al validar si el vehículo está asignado en trazabilidad');
    }
  }
}