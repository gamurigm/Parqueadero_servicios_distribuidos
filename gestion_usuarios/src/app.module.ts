import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsuarioModule } from './usuario/usuario.module';
import { PersonaModule } from './persona/persona.module';
import { RolesModule } from './roles/roles.module';
import { RolesUsuarioModule } from './roles_usuario/roles_usuario.module';
import { Person } from './persona/entities/persona.entity';
import { User } from './usuario/entities/usuario.entity';
import { Role } from './roles/entities/role.entity';
import { RolesUsuarios } from './roles_usuario/entities/roles_usuario.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5436', 10),
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'usuarios',
      entities: [Person, User, Role, RolesUsuarios],
      synchronize: true,
      logging: true,
    }),
    UsuarioModule,
    PersonaModule,
    RolesModule,
    RolesUsuarioModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
