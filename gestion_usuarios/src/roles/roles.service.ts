import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';
import { Not, Repository } from 'typeorm';
import { RolesUsuarios } from '../roles_usuario/entities/roles_usuario.entity';
import { Utils } from '../utils/utils';

@Injectable()
export class RolesService {
  private utils : Utils;
  constructor(
    @InjectRepository(Role)
    private repositorioRoles: Repository<Role>,
    @InjectRepository(RolesUsuarios)
    private repositorioRolesUsuario: Repository<RolesUsuarios>) {
      this.utils = new Utils();
    }

  async create(createRoleDto: CreateRoleDto) {
    const nombre = this.utils.sanitizeString("nombre rol",createRoleDto.nombre);
    
    const existe = await this.repositorioRoles.findOne({
      where:{
        nombre: nombre,
      }
    })

    if(existe) throw new Error('Nombre de rol existente')

    const descripcion = this.utils.sanitizeString("descripcion rol",createRoleDto.descripcion);

    const nuevaAsignacion = new Role();

    nuevaAsignacion.nombre = nombre;
    nuevaAsignacion.descripcion = descripcion;
    
    return this.repositorioRoles.save(nuevaAsignacion);
  }

  async findAll() {
    return this.repositorioRoles.find();
  }

  async findOne(id: string) {
    const idRol = this.utils.sanitizeString("id",id);

    const existe = await this.repositorioRoles.findOne({
      where: { 
        id:idRol,      
        },
    })

    if (!existe) throw new Error('Rol no encontrado');

    return existe;
  }

  async update(id: string, updateRoleDto: UpdateRoleDto) {
    const idRol = this.utils.sanitizeString("id",id);

    const existe = await this.repositorioRoles.findOne({
        where: { id:idRol },
    });

    if (!existe) throw new NotFoundException('Rol no encontrado');

    const nombre = this.utils.sanitizeString("nombre rol",updateRoleDto.nombre);
    const descripcion = this.utils.sanitizeString("descripcion rol",updateRoleDto.descripcion);
    if (nombre) {
        const nombreExiste = await this.repositorioRoles.findOne({
            where: { 
                nombre: nombre,
                id: Not(idRol) 
            }
        });

        if (nombreExiste) {
            throw new ConflictException('Otro rol ya existe con este nombre');
        }

        if (nombre === existe.nombre && descripcion === existe.descripcion) {
            throw new ConflictException('No realizo cambios en el rol, se deshizo la acción');
        }
    }

    const datosActualizar: Partial<Role> = {
        updatedAt: new Date()
    };

    if (nombre && nombre !== existe.nombre) {
        datosActualizar.nombre = nombre;
    }

    if (descripcion && descripcion !== existe.descripcion) {
        datosActualizar.descripcion = descripcion;
    }

    if (updateRoleDto.activo !== undefined) {
        datosActualizar.activo = updateRoleDto.activo;
    }

    if (Object.keys(datosActualizar).length === 1) { 
        throw new BadRequestException('No hay cambios para actualizar');
    }

    await this.repositorioRoles.update(idRol, datosActualizar);

    return this.findOne(idRol);
  }

  async activarDesactivar(id: string) {
    const idRol = this.utils.sanitizeString("id",id);

    const rol = await this.findOne(idRol);

    const nuevoEstado = !rol.activo;

    const tieneUsuarios = await this.repositorioRolesUsuario.count({
      where:{ id_rol : idRol,}
    });

    if (tieneUsuarios > 0 && nuevoEstado === false) {
       throw new ConflictException('No se puede desactivar un rol que tiene usuarios asignados');
     }

    await this.repositorioRoles.update(idRol, { 
      activo: nuevoEstado,
      updatedAt: new Date() 
    });

    return this.findOne(id);
  }


  async remove(id: string) {
    const idRol = this.utils.sanitizeString("id",id);

    const existe = await this.findOne(idRol);
    if(!existe) throw new Error('No se encontro el rol buscado')

    const tieneUsuarios = await this.repositorioRolesUsuario.count({
       where: { id_rol: idRol }
     });

      if (tieneUsuarios > 0) {
        throw new ConflictException('No se puede eliminar un rol que tiene usuarios asignados');
      }

    await this.repositorioRoles.delete(idRol);
    return { message: 'Rol eliminado correctamente' };
  }
}