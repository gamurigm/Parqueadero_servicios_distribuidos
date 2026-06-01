import { Repository } from 'typeorm';
import { EventoTrazabilidad, Microservicio, TipoAccion } from './entities/trazabilidad.entity';
import { Asignacion } from '../asignacion/entities/asignacion.entity';
import { RegistrarEventoDto } from './dto/registrar-evento.dto';
import { VehiculosClientService } from '../vehiculos-client/vehiculos-client.service';
import { UsuariosClientService } from '../usuarios-client/usuarios-client.service';
export declare class TrazabilidadService {
    private readonly trazabilidadRepo;
    private readonly vehiculosClientService;
    private readonly usuariosClientService;
    private readonly logger;
    constructor(trazabilidadRepo: Repository<EventoTrazabilidad>, vehiculosClientService: VehiculosClientService, usuariosClientService: UsuariosClientService);
    registrarEvento(dto: RegistrarEventoDto): Promise<EventoTrazabilidad>;
    registrar(tipo: TipoAccion, userId: string, vehicleId: string, descripcion: string, payloadAnterior: Record<string, any> | null, payloadNuevo: Record<string, any> | null): Promise<EventoTrazabilidad>;
    listarPorAsignacion(userId: string, vehicleId: string, authHeader?: string): Promise<any[]>;
    listarPorPropietario(userId: string, authHeader?: string): Promise<any[]>;
    listarTodos(authHeader?: string): Promise<any[]>;
    listarPorMicroservicio(microservicio: Microservicio, authHeader?: string): Promise<any[]>;
    private enriquecerEventos;
    static serializarAsignacion(asignacion: Asignacion): Record<string, any>;
}
