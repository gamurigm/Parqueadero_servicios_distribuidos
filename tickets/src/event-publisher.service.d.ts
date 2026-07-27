import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
export interface AuditEvent {
    servicio: string;
    accion: string;
    entidad: string;
    entidadId?: string;
    datos?: any;
    usuario?: string;
    rol?: string;
    ip?: string;
    mac?: string;
}
export declare class EventPublisher implements OnModuleInit, OnModuleDestroy {
    private configService;
    private readonly logger;
    private connection;
    private channel;
    private exchange;
    private routingKey;
    private isConnected;
    private connectionPromise;
    private reconnectTimeout;
    constructor(configService: ConfigService);
    onModuleInit(): Promise<void>;
    private connect;
    private doConnect;
    private scheduleReconnect;
    publish(event: AuditEvent): Promise<void>;
    onModuleDestroy(): Promise<void>;
}
