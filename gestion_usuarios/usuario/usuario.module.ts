import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsuarioService } from './usuario.service';
import { UsuarioController } from './usuario.controller';
<<<<<<< HEAD
import { TypeOrmModule } from '@nestjs/typeorm';
=======
>>>>>>> 0d2fad668cf260401eff1d05e5a5ca756ad11ec6
import { User } from './entities/usuario.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsuarioController],
  providers: [UsuarioService],
  exports: [UsuarioService],
})
export class UsuarioModule {}
