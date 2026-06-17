import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsuarioModule } from './usuario/usuario.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Person } from './persona/entities/persona.entity';
import { User } from './usuario/entities/usuario.entity';
import { Roles } from './roles/entities/role.entity';
import { RolesUsuarios } from './roles_usuario/entities/roles_usuario.entity';
import { PersonaModule } from './persona/persona.module';
import { RolesModule } from './roles/roles.module';
import { RolesUsuarioModule } from './roles_usuario/roles_usuario.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
         host: configService.get('DB_HOST', 'localhost'),
        port: configService.get('DB_PORT', 5432),  
        username: configService.get('DB_USUARIO', 'admin_user'),
        password: configService.get('DB_CONTRASENA', 'xasmdno123XAW2342as'),
        database: configService.get('DB_NOMBRE', 'UsuariosDB'),
        entities: [Person, User, Roles, RolesUsuarios],
        autoLoadEntities: true,
        synchronize: true,
        logging: true,
      }),
      inject: [ConfigService],
    }),
    PersonaModule,
    RolesModule,
    RolesUsuarioModule,
    UsuarioModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
