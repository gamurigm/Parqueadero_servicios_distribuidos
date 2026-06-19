import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsuarioService } from './usuario.service';
import { UsuarioController } from './usuario.controller';
import { User } from './entities/usuario.entity';
import { Person } from '../persona/entities/persona.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User,Person]) ],
  controllers: [UsuarioController],
  providers: [UsuarioService],
  exports: [UsuarioService],
})
export class UsuarioModule {}