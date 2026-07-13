import { Module } from '@nestjs/common';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';
import { Role } from './entities/role.entity';
import { RolesUsuarios } from '../roles_usuario/entities/roles_usuario.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OpaModule } from '../opa/opa.module';
import { EventPublisher } from '../event-publisher.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Role, RolesUsuarios]),
    OpaModule
  ],
  controllers: [RolesController],
  providers: [RolesService, EventPublisher],
  exports: [RolesService]
})
export class RolesModule {}
