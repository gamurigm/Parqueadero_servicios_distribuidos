import { Module } from '@nestjs/common';
import { PersonaService } from './persona.service';
import { PersonaController } from './persona.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Person } from './entities/persona.entity';
import { User } from '../usuario/entities/usuario.entity';
import { UsuarioModule } from '../usuario/usuario.module';
import { Natural } from './entities/tipos/natural.entity';
import { Juridica } from './entities/tipos/juridica.entity';
import { OpaModule } from '../opa/opa.module';
import { EventPublisher } from '../event-publisher.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Person, User, Natural, Juridica]),
    UsuarioModule,
    OpaModule
  ],
  controllers: [PersonaController],
  providers: [PersonaService, EventPublisher],
  exports: [PersonaService],
})
export class PersonaModule {}
