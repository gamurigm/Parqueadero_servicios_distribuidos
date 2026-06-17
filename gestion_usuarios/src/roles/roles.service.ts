import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Roles } from './entities/role.entity';
import { Not, Repository } from 'typeorm';
import { RolesUsuarios } from '../roles_usuario/entities/roles_usuario.entity';

@Injectable()
export class RolesService {

  constructor(
    @InjectRepository(Roles)
    private repositorioRoles: Repository<Roles>,
  @InjectRepository(RolesUsuarios)
  private repositorioRolesUsuario: Repository<RolesUsuarios>) {}

  async create(createRoleDto: CreateRoleDto) {
    const existe = await this.repositorioRoles.findOne({
      where:{
        nombre: createRoleDto.nombre,
      }
    })

    if(existe) throw new Error('Nombre de rol existente')
    
    const nuevoRol = new Roles();
    nuevoRol.nombre = createRoleDto.nombre;
    nuevoRol.descripcion = createRoleDto.descripcion;
    
    return this.repositorioRoles.save(nuevoRol);
  }

  async findAll() {
    return this.repositorioRoles.find();
  }

  async findOne(id: string) {
    const existe = await this.repositorioRoles.findOne({
      where: { 
        id,      
        },
    })
  
    if (!existe) throw new Error('Rol no encontrado');

    return existe;
  }

  async update(id: string, updateRoleDto: UpdateRoleDto) {
    const existe = await this.repositorioRoles.findOne({
        where: { id },
    });

    if (!existe) throw new NotFoundException('Rol no encontrado');

    if (updateRoleDto.nombre) {
        const nombreExiste = await this.repositorioRoles.findOne({
            where: { 
                nombre: updateRoleDto.nombre,
                id: Not(id) 
            }
        });

        if (nombreExiste) {
            throw new ConflictException('Otro rol ya existe con este nombre');
        }

        if (updateRoleDto.nombre === existe.nombre && updateRoleDto.descripcion === existe.descripcion) {
            throw new ConflictException('No realizo cambios en el rol');
        }
    }

    const datosActualizar: Partial<Roles> = {
        updated_at: new Date()
    };

    if (updateRoleDto.nombre && updateRoleDto.nombre !== existe.nombre) {
        datosActualizar.nombre = updateRoleDto.nombre;
    }

    if (updateRoleDto.descripcion && updateRoleDto.descripcion !== existe.descripcion) {
        datosActualizar.descripcion = updateRoleDto.descripcion;
    }

    if (updateRoleDto.activo !== undefined) {
        datosActualizar.activo = updateRoleDto.activo;
    }

    if (Object.keys(datosActualizar).length === 1) { 
        throw new BadRequestException('No hay cambios para actualizar');
    }

    await this.repositorioRoles.update(id, datosActualizar);

    return this.findOne(id);
}

 async activarDesactivar(id: string) {
    const rol = await this.findOne(id);

    const nuevoEstado = !rol.activo;

    const tieneUsuarios = await this.repositorioRolesUsuario.count({
     where:{ id_rol : id,}
    });

    if (tieneUsuarios > 0 && nuevoEstado === false) {
       throw new ConflictException('No se puede desactivar un rol que tiene usuarios asignados');
     }

    await this.repositorioRoles.update(id, { 
      activo: nuevoEstado,
      updated_at: new Date() 
    });

    return this.findOne(id);
  }


  async remove(id: string) {
    const existe = await this.findOne(id);
    if(!existe) throw new Error('No se encontro el rol buscado')

    const tieneUsuarios = await this.repositorioRolesUsuario.count({
       where: { id_rol: id }
     });

     if (tieneUsuarios > 0) {
       throw new ConflictException('No se puede eliminar un rol que tiene usuarios asignados');
     }

    await this.repositorioRoles.delete(id);
    return { message: 'Rol eliminado correctamente' };
  }
}
