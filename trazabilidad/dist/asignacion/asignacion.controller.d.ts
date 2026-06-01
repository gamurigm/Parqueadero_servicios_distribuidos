import { AsignacionService } from './asignacion.service';
import { TrazabilidadService } from '../trazabilidad/trazabilidad.service';
import { CreateAsignacionDto } from './dto/create-asignacion.dto';
import { UpdateAsignacionDto } from './dto/update-asignacion.dto';
export declare class AsignacionController {
    private readonly asignacionService;
    private readonly trazabilidadService;
    constructor(asignacionService: AsignacionService, trazabilidadService: TrazabilidadService);
    crear(dto: CreateAsignacionDto): Promise<import("./entities/asignacion.entity").Asignacion>;
    listar(): Promise<import("./entities/asignacion.entity").Asignacion[]>;
    obtenerFlota(userId: string, authHeader?: string): Promise<any[]>;
    listarTrazabilidad(): Promise<any[]>;
    listarTrazabilidadPorPropietario(userId: string): Promise<any[]>;
    listarTrazabilidadPorAsignacion(userId: string, vehicleId: string): Promise<any[]>;
    buscarPorClave(userId: string, vehicleId: string): Promise<import("./entities/asignacion.entity").Asignacion>;
    actualizar(userId: string, vehicleId: string, dto: UpdateAsignacionDto): Promise<import("./entities/asignacion.entity").Asignacion>;
    eliminar(userId: string, vehicleId: string): Promise<{
        message: string;
    }>;
}
