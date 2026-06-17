import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateRolesUsuarioDto } from './dto/create-roles_usuario.dto';
import { UpdateRolesUsuarioDto } from './dto/update-roles_usuario.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { RolesUsuarios } from './entities/roles_usuario.entity';
import { Repository } from 'typeorm';
import { User } from '../usuario/entities/usuario.entity';
import { Role } from '../roles/entities/role.entity';
import { ActiveDeactiveRolesUsuarioDto } from './dto/active-deactive-roles_usuario.dto';

@Injectable()
export class RolesUsuarioService {
  constructor(
        @InjectRepository(RolesUsuarios)
        private repositorioRolesUsuario: Repository<RolesUsuarios>,
        @InjectRepository(User)
        private repositorioUsuario: Repository<User>,
        @InjectRepository(Role)
        private repositorioRoles: Repository<Role>,
    ) {}

  async create(createRolesUsuarioDto: CreateRolesUsuarioDto) {
        const user = await this.repositorioUsuario.findOne({
            where: { id: createRolesUsuarioDto.id_user}
        });
        if (!user) {
            throw new NotFoundException('Usuario no encontrado');
        }

        const role = await this.repositorioRoles.findOne({
            where: { id: createRolesUsuarioDto.id_rol }
        });
        if (!role) {
            throw new NotFoundException('Rol no encontrado');
        }

        const exists = await this.repositorioRolesUsuario.findOne({
            where: {
                id_usuario: createRolesUsuarioDto.id_user,
                id_rol: createRolesUsuarioDto.id_rol
            }
        });

        if (exists) {
            throw new ConflictException('El usuario ya tiene este rol asignado');
        }

        const userRole = this.repositorioRolesUsuario.create({
            id_usuario: createRolesUsuarioDto.id_user,
            id_rol: createRolesUsuarioDto.id_rol,
        });

        return this.repositorioRolesUsuario.save(userRole);
  }

  async findAll() {
    return this.repositorioRolesUsuario.find();
  }

  async findOne(updateRolesUsuarioDto: UpdateRolesUsuarioDto) {
    const existe =this.repositorioRolesUsuario.findOne({
      where: {
        id_rol:updateRolesUsuarioDto.id_rol,
        id_usuario:updateRolesUsuarioDto.id_user
        },
    })

    if (!existe) throw new Error('Rol no encontrado');

    return existe;
  }

  async findRolesByUser(id_usuario:string) {
    const existe =this.repositorioRolesUsuario.find({
      where: {
        id_usuario
        },
    })

    if (!existe) throw new Error('Roles no encontrados');

    return existe;
  }

  async findUsersByRoles(id_rol:string) {
    const existe =this.repositorioRolesUsuario.find({
      where: {
        id_rol
        },
    })

    if (!existe) throw new Error('Usuarios no encontrados');

    return existe;
  }

  async update(updateRolesUsuarioDto: UpdateRolesUsuarioDto) {
    const existNewRole = await this.repositorioRoles.findOne({
        where: {
            id: updateRolesUsuarioDto.id_nuevo_rol
        }
    });

    if (!existNewRole) throw new NotFoundException('El nuevo rol no existe');

    const userRole = await this.repositorioRolesUsuario.findOne({
        where: {
            id_usuario: updateRolesUsuarioDto.id_user,
            id_rol: updateRolesUsuarioDto.id_rol
        }
    });

    if (!userRole) throw new NotFoundException('El usuario no tiene este rol asignado');

    const existingNewRole = await this.repositorioRolesUsuario.findOne({
        where: {
            id_usuario: updateRolesUsuarioDto.id_user,
            id_rol: updateRolesUsuarioDto.id_nuevo_rol
        }
    });

    if (existingNewRole)throw new ConflictException('El usuario ya tiene el nuevo rol asignado');

    await this.repositorioRolesUsuario.delete({
        id_usuario: updateRolesUsuarioDto.id_user,
        id_rol: updateRolesUsuarioDto.id_rol
    });

    const newUserRole = this.repositorioRolesUsuario.create({
        id_usuario: updateRolesUsuarioDto.id_user,
        id_rol: updateRolesUsuarioDto.id_nuevo_rol,
    });

    return this.repositorioRolesUsuario.save(newUserRole);
}

  async activarDesactivar(activeDeactiveRolesUsuarioDTO: ActiveDeactiveRolesUsuarioDto) {
    const userRole = await this.repositorioRolesUsuario.findOne({
        where: {
            id_usuario: activeDeactiveRolesUsuarioDTO.id_user,
            id_rol: activeDeactiveRolesUsuarioDTO.id_rol
        }
    });

    if (!userRole) {
        throw new NotFoundException('El usuario no tiene este rol asignado');
    }

    userRole.activo = !userRole.activo;
    userRole.updatedAt = new Date();

    await this.repositorioRolesUsuario.save(userRole);

    return {
        message: `Rol ${userRole.activo ? 'activado' : 'desactivado'} correctamente al usuario`,
        userRole
    };
}

  async remove(updateRolesUsuarioDto: UpdateRolesUsuarioDto) {
    const existe = await this.repositorioRolesUsuario.findOne({
            where: {
              id_usuario: updateRolesUsuarioDto.id_user,
              id_rol: updateRolesUsuarioDto.id_rol
            }
        });

        if (!existe) {
            throw new NotFoundException('La asignacion no existe');
        }

        await this.repositorioRolesUsuario.delete({
            id_usuario: updateRolesUsuarioDto.id_user,
            id_rol: updateRolesUsuarioDto.id_rol
        });

        return { message: 'Rol removido correctamente' };
  }
}
