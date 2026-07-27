import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsuarioService } from './usuario.service';
import { UsuarioController } from './usuario.controller';
import { User } from './entities/usuario.entity';
import { Person } from '../persona/entities/persona.entity';
import { RolesUsuarios } from '../roles_usuario/entities/roles_usuario.entity';
import { RefreshToken } from '../auth/entities/refresh-token.entity';
import { OpaModule } from '../opa/opa.module';
import { EventPublisher } from '../event-publisher.service';

@Module({
  imports: [TypeOrmModule.forFeature([User,Person,RolesUsuarios,RefreshToken]), OpaModule],
  controllers: [UsuarioController],
  providers: [UsuarioService, EventPublisher],
  exports: [UsuarioService],
})
export class UsuarioModule {}