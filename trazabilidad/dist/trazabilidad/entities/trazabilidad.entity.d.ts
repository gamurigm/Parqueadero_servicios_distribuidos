export declare enum TipoAccion {
    CREACION = "CREACION",
    MODIFICACION = "MODIFICACION",
    ELIMINACION = "ELIMINACION",
    CONSULTA = "CONSULTA",
    LOGIN = "LOGIN",
    ACTIVACION = "ACTIVACION",
    DESACTIVACION = "DESACTIVACION",
    EMISION = "EMISION",
    PAGO = "PAGO",
    ANULACION = "ANULACION"
}
export declare enum Microservicio {
    TRAZABILIDAD = "TRAZABILIDAD",
    USUARIOS = "USUARIOS",
    VEHICULOS = "VEHICULOS",
    ZONAS = "ZONAS",
    TICKETS = "TICKETS"
}
export declare class EventoTrazabilidad {
    id: string;
    microservicio: Microservicio;
    endpoint: string;
    metodoHttp: string;
    entidadId: string;
    descripcion: string;
    usuarioEjecutor: string;
    usuarioEjecutorNombre: string;
    userId: string;
    vehicleId: string;
    tipoAccion: TipoAccion;
    timestamp: Date;
    payloadAnterior: Record<string, any> | null;
    payloadNuevo: Record<string, any> | null;
}
