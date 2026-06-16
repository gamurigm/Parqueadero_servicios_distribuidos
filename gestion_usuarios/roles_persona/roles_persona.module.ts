import { Module } from '@nestjs/common';
import { RolesPersonaService } from './roles_persona.service';
import { RolesPersonaController } from './roles_persona.controller';

@Module({
  controllers: [RolesPersonaController],
  providers: [RolesPersonaService],
})
export class RolesPersonaModule {}
