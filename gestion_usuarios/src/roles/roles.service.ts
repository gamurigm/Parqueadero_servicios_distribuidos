import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';
import { Not, Repository } from 'typeorm';
import { RolesUsuarios } from '../roles_usuario/entities/roles_usuario.entity';
import { Utils } from '../utils/utils';
import { AuditEvent, EventPublisher } from '../event-publisher.service';

@Injectable()
export class RolesService {
  private utils : Utils;
  constructor(
    @InjectRepository(Role)
    private repositorioRoles: Repository<Role>,
    @InjectRepository(RolesUsuarios)
    private repositorioRolesUsuario: Repository<RolesUsuarios>,
    private readonly eventPublisher: EventPublisher) {
      this.utils = new Utils();
    }

  private async emitEvent(
    accion: string,
    datos: any,
    usuario?: string,
    rol?: string,
    ip?: string,
    mac?: string,
  ) {
    const event: AuditEvent = {
      servicio: 'ms-usuarios',
      accion,
      entidad: 'ROL',
      usuario,
      rol,
      ip,
      mac,
      datos,
    };
    await this.eventPublisher.publish(event);
  }

  async create(createRoleDto: CreateRoleDto, ip?: string, mac?: string, username?: string) {
    const nombre = this.utils.sanitizeString("nombre rol",createRoleDto.nombre);
    
    const existe = await this.repositorioRoles.findOne({
      where:{
        nombre: nombre,
      }
    })

    if(existe) throw new ConflictException('Nombre de rol existente')

    const descripcion = this.utils.sanitizeString("descripcion rol",createRoleDto.descripcion);

    const nuevaAsignacion = new Role();

    nuevaAsignacion.nombre = nombre;
    nuevaAsignacion.descripcion = descripcion;
    
    const saved = await this.repositorioRoles.save(nuevaAsignacion);

    await this.emitEvent('CREATE', saved, username, undefined, ip, mac);

    return saved;
  }

  async findAll() {
    return this.repositorioRoles.find();
  }

  async findOne(id: string) {
    
    const idRol = this.utils.validateUUID(id);

    const existe = await this.repositorioRoles.findOne({
      where: { 
        id:idRol,      
        },
    })

    if (!existe) throw new Error('Rol no encontrado');

    return existe;
  }

  async update(id: string, updateRoleDto: UpdateRoleDto, ip?: string, mac?: string, username?: string) {
    const idRol = this.utils.validateUUID(id);

    const existe = await this.repositorioRoles.findOne({
        where: { id:idRol },
    });

    if (!existe) throw new NotFoundException('Rol no encontrado');

    const nombre = this.utils.sanitizeString("nombre rol",updateRoleDto.nombre);
   
    const nombreExiste = await this.repositorioRoles.findOne({
        where: { 
            nombre: nombre,
            id: Not(idRol) 
        }
    });

    const descripcion = this.utils.sanitizeString("descripcion rol",updateRoleDto.descripcion);
    if (nombreExiste) throw new ConflictException('Otro rol ya existe con este nombre');
     

    if (nombre === existe.nombre && descripcion === existe.descripcion) throw new ConflictException('No realizo cambios en el rol, se deshizo la acción');

    const datosActualizar: Partial<Role> = {
        updatedAt: new Date()
    };

    if (nombre && nombre !== existe.nombre) datosActualizar.nombre = nombre;
    

    if (descripcion && descripcion !== existe.descripcion) datosActualizar.descripcion = descripcion;
    

    if (updateRoleDto.activo !== undefined) datosActualizar.activo = updateRoleDto.activo;
    
    await this.repositorioRoles.update(idRol, datosActualizar);

    const updated = await this.findOne(idRol);

    await this.emitEvent('UPDATE', updated, username, undefined, ip, mac);

    return updated;
  }

  async activarDesactivar(id: string, ip?: string, mac?: string, username?: string) {
    const idRol = this.utils.validateUUID(id);

    const rol = await this.repositorioRoles.findOne({
      where:{
        id:idRol,
      }
    });

    if(!rol) throw new NotFoundException("El rol no fue encontrado")

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

    const updated = await this.findOne(id);

    await this.emitEvent('UPDATE', updated, username, undefined, ip, mac);

    return updated;
  }

  async remove(id: string, ip?: string, mac?: string, username?: string) {
    const idRol = this.utils.validateUUID(id);

    const existe = await this.repositorioRoles.findOne({
      where:{
        id:idRol
      }
    });

    if(!existe) throw new NotFoundException('No se encontro el rol buscado')

    const tieneUsuarios = await this.repositorioRolesUsuario.count({
       where: { id_rol: idRol }
     });

      if (tieneUsuarios > 0) {
        throw new ConflictException('No se puede eliminar un rol que tiene usuarios asignados');
      }

    await this.repositorioRoles.delete(idRol);

    await this.emitEvent('DELETE', { id: idRol, nombre: existe.nombre }, username, undefined, ip, mac);

    return { message: 'Rol eliminado correctamente' };
  }
}