import { Repository } from 'typeorm';
import { Asignacion } from './entities/asignacion.entity';
import { CreateAsignacionDto } from './dto/create-asignacion.dto';
import { UpdateAsignacionDto } from './dto/update-asignacion.dto';
import { TrazabilidadService } from '../trazabilidad/trazabilidad.service';
import { VehiculosClientService } from '../vehiculos-client/vehiculos-client.service';
export declare class AsignacionService {
    private readonly asignacionRepo;
    private readonly trazabilidadService;
    private readonly vehiculosClientService;
    private utils;
    constructor(asignacionRepo: Repository<Asignacion>, trazabilidadService: TrazabilidadService, vehiculosClientService: VehiculosClientService);
    crear(dto: CreateAsignacionDto): Promise<Asignacion>;
    listar(): Promise<Asignacion[]>;
    buscarPorClave(userId: string, vehicleId: string): Promise<Asignacion>;
    actualizar(userId: string, vehicleId: string, dto: UpdateAsignacionDto): Promise<Asignacion>;
    eliminar(userId: string, vehicleId: string): Promise<{
        message: string;
    }>;
    obtenerFlotaPorPropietario(userId: string): Promise<any[]>;
}
