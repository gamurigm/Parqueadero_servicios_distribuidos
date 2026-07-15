import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolesUsuarioService } from './roles_usuario.service';
import { RolesUsuarioController } from './roles_usuario.controller';
import { RolesUsuarios } from './entities/roles_usuario.entity';
import { User } from '../usuario/entities/usuario.entity';
import { Role } from '../roles/entities/role.entity';
import { OpaModule } from '../opa/opa.module';
import { EventPublisher } from '../event-publisher.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([RolesUsuarios, User, Role]),
    OpaModule
  ],
  controllers: [RolesUsuarioController],
  providers: [RolesUsuarioService, EventPublisher],
  exports: [RolesUsuarioService]
})
export class RolesUsuarioModule {}
