import { Module } from '@nestjs/common';
import { PersonaService } from './persona.service';
import { PersonaController } from './persona.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Person } from './entities/persona.entity';
import { User } from '../usuario/entities/usuario.entity';
import { UsuarioModule } from '../usuario/usuario.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Person, User]),
    UsuarioModule
  ],
  controllers: [PersonaController],
  providers: [PersonaService],
})
export class PersonaModule {}
