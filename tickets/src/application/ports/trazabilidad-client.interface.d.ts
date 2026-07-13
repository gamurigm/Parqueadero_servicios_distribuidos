export interface RegistrarEventoDto {
    microservicio: string;
    endpoint: string;
    metodoHttp: string;
    tipoAccion: string;
    descripcion: string;
    entidadId?: string;
    usuarioEjecutor?: string;
    payloadAnterior?: any;
    payloadNuevo?: any;
}
export declare const TRAZABILIDAD_CLIENT = "TRAZABILIDAD_CLIENT";
export interface ITrazabilidadClient {
    registrarEvento(dto: RegistrarEventoDto): Promise<void>;
}
