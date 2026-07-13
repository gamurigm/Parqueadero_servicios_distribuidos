import { TrazabilidadService } from './trazabilidad.service';
import { RegistrarEventoDto } from './dto/registrar-evento.dto';
export declare class TrazabilidadController {
    private readonly trazabilidadService;
    constructor(trazabilidadService: TrazabilidadService);
    registrarEvento(dto: RegistrarEventoDto): Promise<import("./entities/trazabilidad.entity").EventoTrazabilidad>;
    listarTodos(authHeader: string): Promise<any[]>;
    listarPorMicroservicio(nombre: string, authHeader: string): Promise<any[]>;
    listarPorPropietario(userId: string, authHeader: string): Promise<any[]>;
    listarPorAsignacion(userId: string, vehicleId: string, authHeader: string): Promise<any[]>;
}
