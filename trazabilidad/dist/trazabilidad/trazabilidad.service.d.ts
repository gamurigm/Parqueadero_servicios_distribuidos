import { Repository } from 'typeorm';
import { EventoTrazabilidad, TipoAccion } from './entities/trazabilidad.entity';
import { Asignacion } from '../asignacion/entities/asignacion.entity';
export declare class TrazabilidadService {
    private readonly trazabilidadRepo;
    constructor(trazabilidadRepo: Repository<EventoTrazabilidad>);
    registrar(tipo: TipoAccion, userId: string, vehicleId: string, payloadAnterior: Record<string, any> | null, payloadNuevo: Record<string, any> | null): Promise<EventoTrazabilidad>;
    listarPorAsignacion(userId: string, vehicleId: string): Promise<EventoTrazabilidad[]>;
    listarPorPropietario(userId: string): Promise<EventoTrazabilidad[]>;
    listarTodos(): Promise<EventoTrazabilidad[]>;
    static serializarAsignacion(asignacion: Asignacion): Record<string, any>;
}
