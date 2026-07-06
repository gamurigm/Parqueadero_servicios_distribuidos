import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
<<<<<<< HEAD
import * as fs from 'fs';
import * as path from 'path';
=======
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
>>>>>>> c1fcd81203b82c3c3faab7c399f9c07c1e843b32

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
<<<<<<< HEAD
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: fs.readFileSync(
        path.resolve(__dirname, '../../../jwt-keys/jwt-public.pem'),
        'utf-8',
      ),
=======
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
>>>>>>> c1fcd81203b82c3c3faab7c399f9c07c1e843b32
      algorithms: ['RS256'],
    });
  }

  async validate(payload: JwtPayload) {
    return {
      id: payload.sub,
      username: payload.username,
      roles: payload.roles || [],
      iss: payload.iss,
      aud: payload.aud,
      jti: payload.jti,
    };
  }
}