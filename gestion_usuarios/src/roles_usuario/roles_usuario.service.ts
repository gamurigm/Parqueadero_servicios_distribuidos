import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateRolesUsuarioDto } from './dto/create-roles_usuario.dto';
import { UpdateRolesUsuarioDto } from './dto/update-roles_usuario.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { RolesUsuarios } from './entities/roles_usuario.entity';
import { Repository } from 'typeorm';
import { User } from '../usuario/entities/usuario.entity';
import { Role } from '../roles/entities/role.entity';
import { ActiveDeactiveRolesUsuarioDto } from './dto/active-deactive-roles_usuario.dto';
import { Utils } from '../utils/utils';
@Injectable()
export class RolesUsuarioService {
    private utils: Utils;
  constructor(
        @InjectRepository(RolesUsuarios)
        private repositorioRolesUsuario: Repository<RolesUsuarios>,
        @InjectRepository(User)
        private repositorioUsuario: Repository<User>,
        @InjectRepository(Role)
        private repositorioRoles: Repository<Role>,
    ) {
        this.utils = new Utils();
    }

    
  async create(createRolesUsuarioDto: CreateRolesUsuarioDto) {
        
        const idUser = this.utils.validateUUID(createRolesUsuarioDto.id_user);
        const idRol = this.utils.validateUUID(createRolesUsuarioDto.id_rol);

        const user = await this.repositorioUsuario.findOne({
            where: { id: idUser}
        });

        if (!user) throw new NotFoundException('Usuario no encontrado');

        if(!user.active) throw new ConflictException("No se puede asignar un rol a un usuario inactivo");

        const role = await this.repositorioRoles.findOne({
            where: { id: idRol }
        });

        if (!role) throw new NotFoundException('Rol no encontrado');

        if (!role.activo) throw new NotFoundException('No se puede asignar a un usuario un rol inactivo');
        
        const exists = await this.repositorioRolesUsuario.findOne({
            where: {
                id_usuario: idUser,
                id_rol: idRol
            }
        });

        if (exists)  throw new ConflictException('El usuario ya tiene este rol asignado');

        const userRole = this.repositorioRolesUsuario.create({
            id_usuario: idUser,
            id_rol: idRol,
        });

        return this.repositorioRolesUsuario.save(userRole);
  }

  async findAll() {
    return this.repositorioRolesUsuario.find();
  }

  async findOne(updateRolesUsuarioDto: UpdateRolesUsuarioDto) {

    const idUser = this.utils.sanitizeString("id usuario",updateRolesUsuarioDto.id_user);
    const idRol = this.utils.sanitizeString("id rol",updateRolesUsuarioDto.id_rol);

    const existe =this.repositorioRolesUsuario.findOne({
      where: {
        id_rol:idRol,
        id_usuario:idUser
        },
    })

    if (!existe) throw new Error('Asigniacion no encontrado');

    return existe;
  }

  async findRolesByUser(id_usuario:string) {
    const idUser = this.utils.validateUUID(id_usuario);

    const existe =this.repositorioRolesUsuario.find({
      where: {
        id_usuario: idUser
        },
    })

    if (!existe) throw new NotFoundException('Roles no encontrados');

    return existe;
  }

  async findUsersByRoles(id_rol:string) {
    const idRol = this.utils.validateUUID(id_rol);
    const existe =this.repositorioRolesUsuario.find({
      where: {
        id_rol: idRol
        },
    })

    if (!existe) throw new NotFoundException('Usuarios con el rol asigndo no encontrados');

    return existe;
  }

  async update(updateRolesUsuarioDto: UpdateRolesUsuarioDto) {
    const idUser = this.utils.sanitizeString("id usuario",updateRolesUsuarioDto.id_user);
    const idRol = this.utils.sanitizeString("id rol",updateRolesUsuarioDto.id_rol);
    const idNuevoRol = this.utils.sanitizeString("id nuevo rol",updateRolesUsuarioDto.id_nuevo_rol);
    const existNewRole = await this.repositorioRoles.findOne({
        where: {
            id: idNuevoRol
        }
    });

    if (!existNewRole) throw new NotFoundException('El nuevo rol no existe');

    const userRole = await this.repositorioRolesUsuario.findOne({
        where: {
            id_usuario: idUser,
            id_rol: idRol
        }
    });

    if (!userRole) throw new NotFoundException('El usuario no tiene este rol asignado');

    const existingNewRole = await this.repositorioRolesUsuario.findOne({
        where: {
            id_usuario: idUser,
            id_rol: idNuevoRol
        }
    });

     if (await existingNewRole)throw new ConflictException('El usuario ya tiene el nuevo rol asignado');

    await this.repositorioRolesUsuario.delete({
        id_usuario: idUser,
        id_rol: idRol
    });

    const newUserRole = this.repositorioRolesUsuario.create({
        id_usuario: idUser,
        id_rol: idNuevoRol
    });

    return this.repositorioRolesUsuario.save(newUserRole);
}

  async activarDesactivar(activeDeactiveRolesUsuarioDTO: ActiveDeactiveRolesUsuarioDto) {

    const idUser = this.utils.sanitizeString("id usuario",activeDeactiveRolesUsuarioDTO.id_user);
    const idRol = this.utils.sanitizeString("id rol",activeDeactiveRolesUsuarioDTO.id_rol);

    const userRole = await this.repositorioRolesUsuario.findOne({
        where: {
            id_usuario: idUser,
            id_rol: idRol
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
    const idUser = this.utils.sanitizeString("id usuario",updateRolesUsuarioDto.id_user);
    const idRol = this.utils.sanitizeString("id rol",updateRolesUsuarioDto.id_rol);

    const existe = await this.repositorioRolesUsuario.findOne({
            where: {
              id_usuario: idUser,
              id_rol: idRol
            }
        });

        if (!existe) {
            throw new NotFoundException('La asignacion no existe');
        }

        await this.repositorioRolesUsuario.delete({
            id_usuario: idUser,
            id_rol: idRol
        });

        return { message: 'Rol removido correctamente' };
  }
}
