import { Microservicio, TipoAccion } from '../entities/trazabilidad.entity';
export declare class RegistrarEventoDto {
    microservicio: Microservicio;
    endpoint: string;
    metodoHttp: string;
    tipoAccion: TipoAccion;
    descripcion: string;
    entidadId?: string;
    usuarioEjecutor?: string;
    usuarioEjecutorNombre?: string;
    userId?: string;
    vehicleId?: string;
    payloadAnterior?: Record<string, any> | null;
    payloadNuevo?: Record<string, any> | null;
}
