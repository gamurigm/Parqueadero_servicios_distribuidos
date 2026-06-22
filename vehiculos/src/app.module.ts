import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { VehiculosModule } from './vehiculos/vehiculos.module';
import { Vehiculo } from './vehiculos/entities/vehiculo.entity';
import { Auto } from './vehiculos/entities/tipos/auto.entity';
import { Motocicleta } from './vehiculos/entities/tipos/motocicleta.entity';
import { Camioneta } from './vehiculos/entities/tipos/camioneta.entity';

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
        port: configService.get('DB_PORT', 5432),  
        username: configService.get('DB_USUARIO', 'admin_user'),
        password: configService.get('DB_CONTRASENA', 'xasmdno123XAW2342as'),
        database: configService.get('DB_NOMBRE', 'VehiculosDB'),
        entities:[Vehiculo, Auto, Motocicleta, Camioneta],
        synchronize: true,
        logging: true,
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    VehiculosModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
  ],
})
export class AppModule {}