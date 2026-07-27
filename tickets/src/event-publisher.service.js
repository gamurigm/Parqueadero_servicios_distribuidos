"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var EventPublisher_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventPublisher = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const amqp = require("amqplib");
let EventPublisher = EventPublisher_1 = class EventPublisher {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(EventPublisher_1.name);
        this.connection = null;
        this.channel = null;
        this.isConnected = false;
        this.connectionPromise = null;
        this.reconnectTimeout = null;
        this.exchange =
            this.configService.get('RABBITMQ_EXCHANGE') ?? 'audit_exchange';
        this.routingKey =
            this.configService.get('RABBITMQ_ROUTING_KEY') ?? 'audit.event';
    }
    async onModuleInit() {
        await this.connect();
    }
    async connect() {
        if (this.connectionPromise) {
            return this.connectionPromise;
        }
        this.connectionPromise = this.doConnect();
        try {
            await this.connectionPromise;
        }
        finally {
            this.connectionPromise = null;
        }
    }
    async doConnect() {
        const host = this.configService.get('RABBITMQ_HOST');
        const port = this.configService.get('RABBITMQ_PORT');
        const user = this.configService.get('RABBITMQ_USER');
        const pass = this.configService.get('RABBITMQ_PASSWORD');
        const url = `amqp://${user}:${pass}@${host}:${port}`;
        try {
            this.connection = await amqp.connect(url);
            this.channel = await this.connection.createChannel();
            await this.channel.assertExchange(this.exchange, 'topic', {
                durable: true,
            });
            this.isConnected = true;
            this.logger.log('Conectado a RabbitMQ para publicacion de eventos');
            this.connection.on('close', () => {
                this.logger.warn('Conexion a RabbitMQ cerrada, intentando reconectar...');
                this.isConnected = false;
                this.channel = null;
                this.connection = null;
                this.scheduleReconnect();
            });
            this.connection.on('error', (err) => {
                this.logger.error(`Error en conexion RabbitMQ: ${err.message}`);
                this.isConnected = false;
                this.channel = null;
                this.connection = null;
                this.scheduleReconnect();
            });
        }
        catch (error) {
            this.isConnected = false;
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
            this.logger.error(`Error conectando a RabbitMQ: ${errorMessage}`);
            this.scheduleReconnect();
        }
    }
    scheduleReconnect() {
        if (this.reconnectTimeout)
            clearTimeout(this.reconnectTimeout);
        this.reconnectTimeout = setTimeout(() => {
            this.logger.log('Intentando reconectar a RabbitMQ...');
            this.connect();
        }, 5000);
    }
    async publish(event) {
        if (!this.isConnected || !this.channel) {
            this.logger.warn('Canal no establecido, intentando conectar...');
            await this.connect();
            if (!this.isConnected || !this.channel) {
                this.logger.error('No se pudo establecer conexion con RabbitMQ, evento no publicado');
                return;
            }
        }
        try {
            const message = Buffer.from(JSON.stringify(event));
            this.channel.publish(this.exchange, this.routingKey, message, {
                persistent: true,
            });
            this.logger.debug(`Evento publicado: ${event.accion} en ${event.servicio}`);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
            this.logger.error(`Error publicando evento: ${errorMessage}`);
            this.isConnected = false;
            this.channel = null;
        }
    }
    async onModuleDestroy() {
        if (this.reconnectTimeout)
            clearTimeout(this.reconnectTimeout);
        try {
            if (this.channel)
                await this.channel.close();
            if (this.connection)
                await this.connection.close();
        }
        catch (error) {
        }
        this.logger.log('Conexion a RabbitMQ cerrada');
    }
};
exports.EventPublisher = EventPublisher;
exports.EventPublisher = EventPublisher = EventPublisher_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], EventPublisher);
//# sourceMappingURL=event-publisher.service.js.map