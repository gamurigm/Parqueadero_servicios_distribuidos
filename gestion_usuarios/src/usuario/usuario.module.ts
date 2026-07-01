import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsuarioService } from './usuario.service';
import { UsuarioController } from './usuario.controller';
import { User } from './entities/usuario.entity';
import { Person } from '../persona/entities/persona.entity';
import { RolesUsuarios } from '../roles_usuario/entities/roles_usuario.entity';
import { OpaModule } from '../opa/opa.module';

@Module({
  imports: [TypeOrmModule.forFeature([User,Person,RolesUsuarios]),OpaModule, ],
  controllers: [UsuarioController],
  providers: [UsuarioService],
  exports: [UsuarioService],
})
export class UsuarioModule {}