import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolesUsuarioService } from './roles_usuario.service';
import { RolesUsuarioController } from './roles_usuario.controller';
import { RolesUsuarios } from './entities/roles_usuario.entity';
import { User } from '../usuario/entities/usuario.entity';
import { Role } from '../roles/entities/role.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([RolesUsuarios, User, Role])
  ],
  controllers: [RolesUsuarioController],
  providers: [RolesUsuarioService],
  exports: [RolesUsuarioService]
})
export class RolesUsuarioModule {}
