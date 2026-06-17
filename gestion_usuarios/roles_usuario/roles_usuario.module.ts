import { Module } from '@nestjs/common';
import { RolesUsuarioService } from './roles_usuario.service';
import { RolesUsuarioController } from './roles_usuario.controller';

@Module({
  controllers: [RolesUsuarioController],
  providers: [RolesUsuarioService],
})
export class RolesUsuarioModule {}
