import { Injectable, UnauthorizedException, BadRequestException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual } from 'typeorm';
import { RolesUsuarios } from '../roles_usuario/entities/roles_usuario.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import { ActiveToken } from './entities/active-token.entity';
import { ConfigService } from '@nestjs/config';
import { LoginDto } from './dto/login.dto';
import { RegisterAuthDto } from './dto/register-auth.dto';
import { RefreshDto } from './dto/refresh.dto';
import { Utils } from '../utils/utils';
import * as crypto from 'node:crypto';
import * as fs from 'node:fs';
import * as jose from 'jose';
import { PersonaService } from '../persona/persona.service';
import { UsuarioService } from '../usuario/usuario.service';
import { RolesUsuarioService } from '../roles_usuario/roles_usuario.service';
import { AuditEvent, EventPublisher } from '../event-publisher.service';

@Injectable()
export class AuthService {
  private utils = new Utils();
  private jweSecret: Uint8Array;

  constructor(
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
    @InjectRepository(ActiveToken)
    private readonly activeTokenRepository: Repository<ActiveToken>,
    @InjectRepository(RolesUsuarios)
    private readonly rolesUsuarioRepository: Repository<RolesUsuarios>,
    private readonly personaService: PersonaService,
    private readonly usuarioService: UsuarioService,
    private readonly rolesUsuarioService: RolesUsuarioService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly eventPublisher: EventPublisher,
  ) {
    this.jweSecret = this.loadJweSecret();
  }

  private loadJweSecret(): Uint8Array {
    try {
      const hex = fs.readFileSync('/keys/jwe-secret.key', 'utf8').trim();
      return Uint8Array.from(Buffer.from(hex, 'hex'));
    } catch {
      console.warn('No se pudo leer /keys/jwe-secret.key. JWE no funcionará.');
      return new Uint8Array(32);
    }
  }

  private async encryptJwe(jwtString: string): Promise<string> {
    return new jose.CompactEncrypt(new TextEncoder().encode(jwtString))
      .setProtectedHeader({ alg: 'dir', enc: 'A256GCM', cty: 'JWT' })
      .encrypt(this.jweSecret);
  }

  async validateToken(jti: string): Promise<boolean> {
    const active = await this.activeTokenRepository.findOne({ where: { jti } });
    if (!active) return false;
    if (active.expiresAt < new Date()) {
      await this.activeTokenRepository.delete({ jti });
      return false;
    }
    return true;
  }

  private async cleanupExpiredTokens() {
    await this.activeTokenRepository.delete({
      expiresAt: LessThanOrEqual(new Date()),
    });
  }

  private async manageActiveToken(jti: string, userId: string, ip: string, expiresAt: Date) {
    await this.cleanupExpiredTokens();

    const existing = await this.activeTokenRepository.findOne({
      where: { userId, ipAddress: ip },
    });

    if (existing && existing.jti !== jti) {
      await this.activeTokenRepository.delete({ jti: existing.jti });
    }

    await this.activeTokenRepository.save(
      this.activeTokenRepository.create({ jti, userId, ipAddress: ip, expiresAt }),
    );
  }

  private async removeActiveToken(jti: string) {
    await this.activeTokenRepository.delete({ jti });
  }

  private async emitAudit(accion: string, username: string, rol?: string, ip?: string, mac?: string, datos?: Record<string, any>) {
    const event: AuditEvent = {
      servicio: 'ms-usuarios',
      accion,
      entidad: 'AUTH',
      usuario: username,
      rol,
      ip,
      mac,
      datos,
    };
    await this.eventPublisher.publish(event);
  }

  async register(registerAuthDto: RegisterAuthDto, ip?: string, mac?: string) {
    const { cedula, firstName, middleName, lastName, email, nationality, phone, address, rolId, password } = registerAuthDto;

    // Validar rolId como UUID (las demás entradas las valida PersonaService internamente)
    const rolIdValidado = this.utils.validateUUID(rolId);

    // 1. Crear Persona con los datos reales del DTO
    // PersonaService sanitiza: dni, firstName, middleName, lastName, email, phone, address, nationality
    const savedPerson = await this.personaService.create({
      dni: cedula,
      firstName,
      middleName,
      lastName,
      email,
      nationality,
      phone,
      address,
      tipo: 'natural',
    }, ip, mac);

    // 2. Crear Usuario — UsuarioService valida UUID del id y sanitiza username, hashea la contraseña
    const savedUser = await this.usuarioService.create({
      id: savedPerson.id,
      username: savedPerson.username,
      password,
    }, ip, mac);

    // 3. Asignar el rol — RolesUsuarioService sanitiza ambos IDs internamente
    await this.rolesUsuarioService.create({
      id_user: savedUser.id,
      id_rol: rolIdValidado,
    }, ip, mac);

    return {
      ...savedUser,
      username: savedPerson.username,
    };
  }

  async login(loginDto: LoginDto, ip?: string, mac?: string) {
    const { username, password } = loginDto;

    // Sanitizar entradas antes de usarlas
    const usernameSnt = this.utils.sanitizeString('nombre usuario', username);

    const user = await this.usuarioService.findByUsernameWithPassword(usernameSnt);

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    if (!user.active) {
      throw new UnauthorizedException('Usuario inactivo');
    }

    const [salt, storedHash] = user.passwordHash.split(':');
    const hash = crypto.scryptSync(password, salt, 64).toString('hex');
    if (hash !== storedHash) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const lastLogin = await this.usuarioService.markLastLogin(user.id);
    const nombreCompleto = [user.persona?.firstName, user.persona?.middleName, user.persona?.lastName]
      .filter((part): part is string => typeof part === 'string' && part.trim().length > 0)
      .join(' ') || null;

    const rolesAsignados = await this.rolesUsuarioRepository.find({
      where: { id_usuario: user.id, activo: true },
      relations: { role: true },
    });

    const roleNames = rolesAsignados.map((r) => r.role.nombre);

    const payload = {
      iss: this.configService.get<string>('JWT_ISSUER', 'gestion-usuarios'),
      sub: user.id,
      aud: this.configService.get<string>('JWT_AUDIENCE', 'parqueadero-api'),
      jti: crypto.randomUUID(),
    };
    const access_token = this.jwtService.sign(payload);
    const encrypted_token = await this.encryptJwe(access_token);

    const jweExpiresAt = new Date();
    jweExpiresAt.setMinutes(jweExpiresAt.getMinutes() + 15);
    await this.manageActiveToken(payload.jti, user.id, ip || '0.0.0.0', jweExpiresAt);

    const tokenString = crypto.randomBytes(40).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Persistir roles en el refresh token para no tener que re-consultar en cada renovación
    const refreshToken = this.refreshTokenRepository.create({
      token: tokenString,
      usuarioId: user.id,
      expiresAt,
      roles: roleNames,
    });
    await this.refreshTokenRepository.save(refreshToken);

    // Emitir evento de auditoría LOGIN
    this.emitAudit('LOGIN', user.username, roleNames[0], ip, mac, {
      userId: user.id,
      nombreCompleto,
      roles: roleNames,
    }).catch(() => {});

    return {
      access_token: encrypted_token,
      refresh_token: tokenString,
      user: {
        id: user.id,
        username: user.username,
        nombreCompleto,
        roles: roleNames,
        lastLogin,
        persona: user.persona ? {
          id: user.persona.id,
          dni: user.persona.dni,
          email: user.persona.email,
          phone: user.persona.phone,
        } : null,
      },
    };
  }

  async refresh(refreshDto: RefreshDto, ip?: string) {
    const { refreshToken: token } = refreshDto;

    const refreshToken = await this.refreshTokenRepository.findOne({
      where: { token, revoked: false },
      relations: { usuario: true },
    });

    if (!refreshToken || refreshToken.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token inválido o expirado');
    }

    refreshToken.revoked = true;
    await this.refreshTokenRepository.save(refreshToken);

    const user = refreshToken.usuario;
    // Usar roles persistidos en el refresh token (evita re-consultar roles a la DB)
    const roleNames = refreshToken.roles ?? [];

    const payload = {
      iss: this.configService.get<string>('JWT_ISSUER', 'gestion-usuarios'),
      sub: user.id,
      aud: this.configService.get<string>('JWT_AUDIENCE', 'parqueadero-api'),
      jti: crypto.randomUUID(),
    };
    const access_token = this.jwtService.sign(payload);
    const encrypted_token = await this.encryptJwe(access_token);

    const jweExpiresAt = new Date();
    jweExpiresAt.setMinutes(jweExpiresAt.getMinutes() + 15);
    await this.manageActiveToken(payload.jti, user.id, ip || '0.0.0.0', jweExpiresAt);

    const tokenString = crypto.randomBytes(40).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const newRefreshToken = this.refreshTokenRepository.create({
      token: tokenString,
      usuarioId: user.id,
      expiresAt,
      roles: roleNames,
    });
    await this.refreshTokenRepository.save(newRefreshToken);

    return {
      access_token: encrypted_token,
      refresh_token: tokenString,
    };
  }

  async logout(refreshDto: RefreshDto, username?: string, ip?: string, mac?: string, jti?: string) {
    const { refreshToken: token } = refreshDto;
    const refreshToken = await this.refreshTokenRepository.findOne({ where: { token } });
    if (refreshToken) {
      refreshToken.revoked = true;
      await this.refreshTokenRepository.save(refreshToken);
    }

    if (jti) {
      await this.removeActiveToken(jti);
    }

    // Emitir evento de auditoría LOGOUT
    if (username) {
      this.emitAudit('LOGOUT', username, undefined, ip, mac).catch(() => {});
    }

    return { message: 'Sesión cerrada' };
  }

  async getProfile(userId: string) {
    return this.usuarioService.findOne(userId);
  }
}
