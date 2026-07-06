import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import * as fs from 'fs';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../usuario/entities/usuario.entity';

export interface JwtPayload {
  iss: string;
  sub: string;
  aud: string;
  exp: number;
  iat: number;
  jti: string;
  username: string;
  roles: string[];
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {
    let publicKey = configService.get<string>('JWT_SECRET', 'super-secret-key-change-in-production');
    try {
      publicKey = fs.readFileSync('/keys/public.pem', 'utf8');
    } catch (e) {
      console.warn('No se pudo leer /keys/public.pem');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: publicKey,
      algorithms: ['RS256'],
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.userRepository.findOne({ where: { id: payload.sub } });
    if (!user || !user.active) throw new UnauthorizedException('Usuario no válido o inactivo');
    return {
      id: payload.sub,
      username: payload.username,
      roles: payload.roles,
      iss: payload.iss,
      aud: payload.aud,
      jti: payload.jti,
    };
  }
}
