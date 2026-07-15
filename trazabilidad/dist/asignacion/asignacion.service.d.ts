import { Repository } from 'typeorm';
import { Asignacion } from './entities/asignacion.entity';
import { CreateAsignacionDto } from './dto/create-asignacion.dto';
import { UpdateAsignacionDto } from './dto/update-asignacion.dto';
import { TrazabilidadService } from '../trazabilidad/trazabilidad.service';
import { VehiculosClientService } from '../vehiculos-client/vehiculos-client.service';
import { UsuariosClientService } from '../usuarios-client/usuarios-client.service';
import { EventPublisher } from '../event-publisher.service';
export declare class AsignacionService {
    private readonly asignacionRepo;
    private readonly trazabilidadService;
    private readonly vehiculosClientService;
    private readonly usuariosClientService;
    private readonly eventPublisher;
    private utils;
    constructor(asignacionRepo: Repository<Asignacion>, trazabilidadService: TrazabilidadService, vehiculosClientService: VehiculosClientService, usuariosClientService: UsuariosClientService, eventPublisher: EventPublisher);
    private emitEvent;
    crear(dto: CreateAsignacionDto, authHeader?: string, ip?: string, mac?: string): Promise<any>;
    listar(authHeader?: string): Promise<any[]>;
    buscarPorClave(userId: string, vehicleId: string, authHeader?: string): Promise<any>;
    actualizar(userId: string, vehicleId: string, dto: UpdateAsignacionDto, authHeader?: string, ip?: string, mac?: string): Promise<any>;
    eliminar(userId: string, vehicleId: string, authHeader?: string, ip?: string, mac?: string): Promise<{
        message: string;
    }>;
    obtenerFlotaPorPropietario(userId: string, authHeader?: string): Promise<any[]>;
    private enriquecerAsignacion;
    private obtenerNombrePropietario;
    private obtenerEtiquetaVehiculo;
}
