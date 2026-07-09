import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventoAuditoria } from './entities/evento-auditoria.entity';
import { CreateAuditEventDto } from './dto/create-audit.dto';

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(EventoAuditoria)
    private readonly auditRepo: Repository<EventoAuditoria>,
  ) {}

  async create(dto: CreateAuditEventDto): Promise<EventoAuditoria> {
    const newEvent = this.auditRepo.create({
      servicio: dto.servicio,
      accion: dto.accion,
      entidad: dto.entidad,
      datos: dto.datos,
      username: dto.usuario,
      rol: dto.rol,
      ip1: dto.ip,
      mac: dto.mac,
      timestamp: new Date(),
    });

    return this.auditRepo.save(newEvent);
  }

  async findAll(): Promise<EventoAuditoria[]> {
    return this.auditRepo.find({ order: { timestamp: 'DESC' } });
  }

  async findOne(id: string): Promise<EventoAuditoria | null> {
    return this.auditRepo.findOne({ where: { id } });
  }
}
