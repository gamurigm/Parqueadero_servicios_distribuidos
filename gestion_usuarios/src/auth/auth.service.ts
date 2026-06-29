import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../usuario/entities/usuario.entity';
import { RolesUsuarios } from '../roles_usuario/entities/roles_usuario.entity';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(RolesUsuarios)
    private readonly rolesUsuarioRepository: Repository<RolesUsuarios>,
    private readonly jwtService: JwtService,
  ) {}

  async login(username: string, password: string) {
    const user = await this.userRepository.findOne({ where: { username } });
    if (!user) throw new UnauthorizedException('Credenciales inválidas');

    const [salt, storedHash] = user.passwordHash.split(':');
    const hash = crypto.scryptSync(password, salt, 64).toString('hex');
    if (hash !== storedHash) throw new UnauthorizedException('Credenciales inválidas');

    if (!user.active) throw new UnauthorizedException('Usuario inactivo');

    const roles = await this.rolesUsuarioRepository.find({
      where: { id_usuario: user.id, activo: true },
      relations: { role: true },
    });

    const roleNames = roles.map((r) => r.role.nombre);

    const payload = { sub: user.id, username: user.username, roles: roleNames };

    return {
      access_token: this.jwtService.sign(payload),
      user: { id: user.id, username: user.username, roles: roleNames },
    };
  }
}
