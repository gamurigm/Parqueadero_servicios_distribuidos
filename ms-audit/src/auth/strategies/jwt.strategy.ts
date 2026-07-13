import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import * as fs from 'fs';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

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
  constructor(configService: ConfigService) {
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

  validate(payload: JwtPayload) {
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
