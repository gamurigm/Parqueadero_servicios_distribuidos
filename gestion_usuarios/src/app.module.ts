import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { UsuarioModule } from './usuario/usuario.module';
import { PersonaModule } from './persona/persona.module';
import { RolesModule } from './roles/roles.module';
import { RolesUsuarioModule } from './roles_usuario/roles_usuario.module';
import { Person } from './persona/entities/persona.entity';
import { User } from './usuario/entities/usuario.entity';
import { Role } from './roles/entities/role.entity';
import { RolesUsuarios } from './roles_usuario/entities/roles_usuario.entity';
import { Natural } from './persona/entities/tipos/natural.entity';
import { Juridica } from './persona/entities/tipos/juridica.entity';
import { RefreshToken } from './auth/entities/refresh-token.entity';
import { ActiveToken } from './auth/entities/active-token.entity';
import { OpaModule } from './opa/opa.module';
import { JweDecryptMiddleware } from './jwe/jwe-decrypt.middleware';

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
        username: configService.get('DB_USER', 'admin_user'),
        password: configService.get('DB_PASSWORD', 'xasmdno123XAW2342as'),
        database: configService.get('DB_NAME', 'UsuariosDB'),
        entities: [Person, User, Role, RolesUsuarios, Natural, Juridica, RefreshToken, ActiveToken],
        synchronize: true,
        logging: true,
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UsuarioModule,
    PersonaModule,
    RolesModule,
    RolesUsuarioModule,
    OpaModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(JweDecryptMiddleware).forRoutes('*');
  }
}