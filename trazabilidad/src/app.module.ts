import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { AsignacionModule } from './asignacion/asignacion.module';
import { TrazabilidadModule } from './trazabilidad/trazabilidad.module';
import { VehiculosClientModule } from './vehiculos-client/vehiculos-client.module';
import { UsuariosClientModule } from './usuarios-client/usuarios-client.module';
import { Asignacion } from './asignacion/entities/asignacion.entity';
import { EventoTrazabilidad } from './trazabilidad/entities/trazabilidad.entity';

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
        port: configService.get<number>('DB_PORT', 5440),
        username: configService.get('DB_USUARIO', 'admin_user'),
        password: configService.get('DB_CONTRASENA', 'xasmdno123XAW2342as'),
        database: configService.get('DB_NOMBRE', 'TrazabilidadDB'),
        entities: [Asignacion, EventoTrazabilidad],
        synchronize: true,
        logging: true,
      }),
      inject: [ConfigService],
    }),
    // HttpModule global para llamadas a otros microservicios
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
    AsignacionModule,
    TrazabilidadModule,
    VehiculosClientModule,
    UsuariosClientModule,
  ],
})
export class AppModule {}
