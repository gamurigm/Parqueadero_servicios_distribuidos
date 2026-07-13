import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateRolesUsuarioDto } from './dto/create-roles_usuario.dto';
import { UpdateRolesUsuarioDto } from './dto/update-roles_usuario.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { RolesUsuarios } from './entities/roles_usuario.entity';
import { FindOptionsRelations, Repository } from 'typeorm';
import { User } from '../usuario/entities/usuario.entity';
import { Role } from '../roles/entities/role.entity';
import { ActiveDeactiveRolesUsuarioDto } from './dto/active-deactive-roles_usuario.dto';
import { Utils } from '../utils/utils';
import { AuditEvent, EventPublisher } from '../event-publisher.service';

@Injectable()
export class RolesUsuarioService {
  private utils: Utils;
  private readonly assignmentRelations: FindOptionsRelations<RolesUsuarios> = {
    user: {
      persona: true,
    },
    role: true,
  };

  constructor(
    @InjectRepository(RolesUsuarios)
    private repositorioRolesUsuario: Repository<RolesUsuarios>,
    @InjectRepository(User)
    private repositorioUsuario: Repository<User>,
    @InjectRepository(Role)
    private repositorioRoles: Repository<Role>,
    private readonly eventPublisher: EventPublisher,
  ) {
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
      entidad: 'ROLES_USUARIO',
      usuario,
      rol,
      ip,
      mac,
      datos,
    };
    await this.eventPublisher.publish(event);
  }

  private validateRequiredUuid(fieldName: string, value?: string) {
    if (!value) throw new BadRequestException(`${fieldName} es requerido`);
    return this.utils.validateUUID(value);
  }

  private buildFullName(user?: User | null) {
    const persona = user?.persona;
    if (!persona) return null;

    const fullName = [persona.firstName, persona.middleName, persona.lastName]
      .filter((part): part is string => typeof part === 'string' && part.trim().length > 0)
      .join(' ');

    return fullName || null;
  }

  private toUserSummary(user?: User | null) {
    if (!user) return null;

    return {
      id: user.id,
      username: user.username,
      nombreCompleto: this.buildFullName(user),
      active: user.active,
      lastLogin: user.lastLogin,
      persona: user.persona ? {
        id: user.persona.id,
        dni: user.persona.dni,
        firstName: user.persona.firstName,
        middleName: user.persona.middleName ?? null,
        lastName: user.persona.lastName,
        email: user.persona.email,
        phone: user.persona.phone,
      } : null,
    };
  }

  private toRoleSummary(role?: Role | null) {
    if (!role) return null;

    return {
      id: role.id,
      nombre: role.nombre,
      descripcion: role.descripcion,
      activo: role.activo,
    };
  }

  private toAssignmentResponse(assignment: RolesUsuarios) {
    return {
      id_usuario: assignment.id_usuario,
      id_rol: assignment.id_rol,
      activo: assignment.activo,
      assignedAt: assignment.assignedAt,
      updatedAt: assignment.updatedAt,
      usuario: this.toUserSummary(assignment.user),
      rol: this.toRoleSummary(assignment.role),
    };
  }

  private async findAssignment(idUser: string, idRol: string) {
    const assignment = await this.repositorioRolesUsuario.findOne({
      where: {
        id_usuario: idUser,
        id_rol: idRol,
      },
      relations: this.assignmentRelations,
    });

    if (!assignment) throw new NotFoundException('Asignacion no encontrada');

    return this.toAssignmentResponse(assignment);
  }

  async create(createRolesUsuarioDto: CreateRolesUsuarioDto, ip?: string, mac?: string) {
    const idUser = this.utils.validateUUID(createRolesUsuarioDto.id_user);
    const idRol = this.utils.validateUUID(createRolesUsuarioDto.id_rol);

    const user = await this.repositorioUsuario.findOne({
      where: { id: idUser },
    });

    if (!user) throw new NotFoundException('Usuario no encontrado');

    if (!user.active) throw new ConflictException('No se puede asignar un rol a un usuario inactivo');

    const role = await this.repositorioRoles.findOne({
      where: { id: idRol },
    });

    if (!role) throw new NotFoundException('Rol no encontrado');

    if (!role.activo) throw new NotFoundException('No se puede asignar a un usuario un rol inactivo');

    const exists = await this.repositorioRolesUsuario.findOne({
      where: {
        id_usuario: idUser,
        id_rol: idRol,
      },
    });

    if (exists) throw new ConflictException('El usuario ya tiene este rol asignado');

    const userRole = this.repositorioRolesUsuario.create({
      id_usuario: idUser,
      id_rol: idRol,
    });

    const savedRole = await this.repositorioRolesUsuario.save(userRole);
    const result = await this.findAssignment(savedRole.id_usuario, savedRole.id_rol);

    await this.emitEvent('CREATE', result, user.username, role.nombre, ip, mac);

    return result;
  }

  async findAll() {
    const assignments = await this.repositorioRolesUsuario.find({
      relations: this.assignmentRelations,
    });

    return assignments.map((assignment) => this.toAssignmentResponse(assignment));
  }

  async findOne(updateRolesUsuarioDto: UpdateRolesUsuarioDto) {
    const idUser = this.validateRequiredUuid('id_user', updateRolesUsuarioDto.id_user);
    const idRol = this.validateRequiredUuid('id_rol', updateRolesUsuarioDto.id_rol);

    return this.findAssignment(idUser, idRol);
  }

  async findRolesByUser(id_usuario: string) {
    const idUser = this.utils.validateUUID(id_usuario);

    const assignments = await this.repositorioRolesUsuario.find({
      where: {
        id_usuario: idUser,
      },
      relations: this.assignmentRelations,
    });

    return assignments.map((assignment) => this.toAssignmentResponse(assignment));
  }

  async findUsersByRoles(id_rol: string) {
    const idRol = this.utils.validateUUID(id_rol);

    const assignments = await this.repositorioRolesUsuario.find({
      where: {
        id_rol: idRol,
      },
      relations: this.assignmentRelations,
    });

    return assignments.map((assignment) => this.toAssignmentResponse(assignment));
  }

  async update(updateRolesUsuarioDto: UpdateRolesUsuarioDto) {
    const idUser = this.validateRequiredUuid('id_user', updateRolesUsuarioDto.id_user);
    const idRol = this.validateRequiredUuid('id_rol', updateRolesUsuarioDto.id_rol);
    const idNuevoRol = this.validateRequiredUuid('id_nuevo_rol', updateRolesUsuarioDto.id_nuevo_rol);

    const existNewRole = await this.repositorioRoles.findOne({
      where: {
        id: idNuevoRol,
      },
    });

    if (!existNewRole) throw new NotFoundException('El nuevo rol no existe');

    const userRole = await this.repositorioRolesUsuario.findOne({
      where: {
        id_usuario: idUser,
        id_rol: idRol,
      },
    });

    if (!userRole) throw new NotFoundException('El usuario no tiene este rol asignado');

    const existingNewRole = await this.repositorioRolesUsuario.findOne({
      where: {
        id_usuario: idUser,
        id_rol: idNuevoRol,
      },
    });

    if (existingNewRole) throw new ConflictException('El usuario ya tiene el nuevo rol asignado');

    await this.repositorioRolesUsuario.delete({
      id_usuario: idUser,
      id_rol: idRol,
    });

    const newUserRole = this.repositorioRolesUsuario.create({
      id_usuario: idUser,
      id_rol: idNuevoRol,
    });

    const savedRole = await this.repositorioRolesUsuario.save(newUserRole);
    return this.findAssignment(savedRole.id_usuario, savedRole.id_rol);
  }

  async activarDesactivar(activeDeactiveRolesUsuarioDTO: ActiveDeactiveRolesUsuarioDto, ip?: string, mac?: string) {
    const idUser = this.validateRequiredUuid('id_user', activeDeactiveRolesUsuarioDTO.id_user);
    const idRol = this.validateRequiredUuid('id_rol', activeDeactiveRolesUsuarioDTO.id_rol);

    const userRole = await this.repositorioRolesUsuario.findOne({
      where: {
        id_usuario: idUser,
        id_rol: idRol,
      },
    });

    if (!userRole) {
      throw new NotFoundException('El usuario no tiene este rol asignado');
    }

    userRole.activo = !userRole.activo;
    userRole.updatedAt = new Date();

    await this.repositorioRolesUsuario.save(userRole);

    const result = await this.findAssignment(idUser, idRol);

    const user = await this.repositorioUsuario.findOne({ where: { id: idUser } });
    const role = await this.repositorioRoles.findOne({ where: { id: idRol } });

    await this.emitEvent('UPDATE', result, user?.username, role?.nombre, ip, mac);

    return {
      message: `Rol ${userRole.activo ? 'activado' : 'desactivado'} correctamente al usuario`,
      userRole: result,
    };
  }

  async remove(updateRolesUsuarioDto: UpdateRolesUsuarioDto) {
    const idUser = this.validateRequiredUuid('id_user', updateRolesUsuarioDto.id_user);
    const idRol = this.validateRequiredUuid('id_rol', updateRolesUsuarioDto.id_rol);

    const existe = await this.repositorioRolesUsuario.findOne({
      where: {
        id_usuario: idUser,
        id_rol: idRol,
      },
    });

    if (!existe) {
      throw new NotFoundException('La asignacion no existe');
    }

    await this.repositorioRolesUsuario.delete({
      id_usuario: idUser,
      id_rol: idRol,
    });

    return { message: 'Rol removido correctamente' };
  }
}
