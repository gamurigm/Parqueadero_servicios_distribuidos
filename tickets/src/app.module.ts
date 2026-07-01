import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { TicketsModule } from './interfaces/controllers/tickets.module';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { OpaModule } from './opa/opa.module';
import { InfrastructureServicesModule } from './infrastructure/services/infrastructure-services.module';
import { TicketEntity } from './infrastructure/persistence/ticket.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 5441),
        username: configService.get('DB_USUARIO', 'admin_user'),
        password: configService.get('DB_CONTRASENA', 't1ck3tsP4ssX2342as'),
        database: configService.get('DB_NOMBRE', 'TicketsDB'),
        entities: [TicketEntity],
        synchronize: true,
        logging: true,
      }),
      inject: [ConfigService],
    }),
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
    AuthModule,
    TicketsModule,
    OpaModule,
    InfrastructureServicesModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
  ],
})
export class AppModule {}
