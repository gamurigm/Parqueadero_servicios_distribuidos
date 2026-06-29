export declare enum TipoAccion {
    CREACION = "CREACION",
    MODIFICACION = "MODIFICACION",
    ELIMINACION = "ELIMINACION"
}
export declare class EventoTrazabilidad {
    id: string;
    userId: string;
    vehicleId: string;
    tipoAccion: TipoAccion;
    timestamp: Date;
    payloadAnterior: Record<string, any> | null;
    payloadNuevo: Record<string, any> | null;
}
