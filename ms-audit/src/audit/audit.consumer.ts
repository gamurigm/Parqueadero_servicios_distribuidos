import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuditService } from './audit.service';
import * as amqp from 'amqplib';
import { plainToClass } from 'class-transformer';
import { CreateAuditEventDto } from './dto/create-audit.dto';
import { validate, ValidationError } from 'class-validator';

@Injectable()
export class AuditConsumer implements OnModuleInit {
    private readonly logger = new Logger(AuditConsumer.name);
    private connection: any;
    private channel: any;

    constructor(
        private configService: ConfigService,
        private auditService: AuditService,
    ) { }

    async onModuleInit() {
        await this.connectWithRetry();
    }

    private async connectWithRetry(): Promise<void> {
        const maxRetries = 10;
        const host = this.configService.get('RABBITMQ_HOST');
        const port = this.configService.get('RABBITMQ_PORT');
        const user = this.configService.get('RABBITMQ_USER');
        const pass = this.configService.get('RABBITMQ_PASS');
        const url = `amqp://${user}:${pass}@${host}:${port}`;

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                this.connection = await amqp.connect(url);
                this.channel = await this.connection.createChannel();
                this.logger.log(`Connected to RabbitMQ at ${host}:${port}`);

                this.connection.on('close', () => {
                    this.logger.warn('RabbitMQ connection closed, reconnecting...');
                    this.channel = null;
                    this.connection = null;
                    setTimeout(() => this.connectWithRetry(), 5000);
                });

                this.connection.on('error', (err: any) => {
                    this.logger.error(`RabbitMQ connection error: ${err.message}`);
                });

                await this.setupConsumer();
                return;

            } catch (error) {
                const msg = error instanceof Error ? error.message : String(error);
                this.logger.warn(
                    `RabbitMQ not ready (attempt ${attempt}/${maxRetries}): ${msg}`,
                );
                if (attempt < maxRetries) {
                    await new Promise(resolve => setTimeout(resolve, 5000));
                }
            }
        }
        this.logger.error('Could not connect to RabbitMQ after max retries');
    }

    private async setupConsumer(): Promise<void> {
        const queue = this.configService.get('RABBITMQ_QUEUE');
        const exchange = this.configService.get('RABBITMQ_EXCHANGE');
        const routingKey = this.configService.get('RABBITMQ_ROUTING_KEY');

        await this.channel.assertExchange(exchange, 'topic', { durable: true });
        await this.channel.assertQueue(queue, { durable: true });
        await this.channel.bindQueue(queue, exchange, routingKey);

        this.channel.consume(
            queue,
            async (msg) => {
                if (msg) {
                    const content = msg.content.toString();
                    this.logger.debug(`Mensaje recibido: ${content}`);
                    try {
                        const raw = JSON.parse(content);
                        const dto = plainToClass(CreateAuditEventDto, raw);
                        const errors = await validate(dto);

                        if (Array.isArray(errors) && errors.length > 0) {
                            const errorMessages = errors.map((e: ValidationError) =>
                                Object.values(e.constraints || {}).join(', '),
                            );
                            this.logger.warn(`DTO invalido: ${errorMessages.join('; ')}`);
                            this.channel.nack(msg, false, false);
                            return;
                        }

                        await this.auditService.create(dto);
                        this.logger.debug('Evento de auditoria guardado exitosamente');
                        this.channel.ack(msg);
                    } catch (err) {
                        const errorMessage =
                            err instanceof Error ? err.message : 'Error desconocido';
                        this.logger.error(`Error procesando mensaje: ${errorMessage}`);
                        this.channel.nack(msg, false, false);
                    }
                }
            },
            { noAck: false },
        );

        this.logger.log(`Consumer listening on queue "${queue}" with exchange "${exchange}"`);
    }
}
