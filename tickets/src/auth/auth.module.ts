import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import * as fs from 'fs';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { OpaModule } from '../opa/opa.module';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        let publicKey = configService.get<string>('JWT_SECRET', 'super-secret-key-change-in-production');
        try {
          publicKey = fs.readFileSync('/keys/public.pem', 'utf8');
        } catch (e) {
          console.warn('No se pudo leer /keys/public.pem');
        }
        return {
          publicKey: publicKey,
          signOptions: { 
            expiresIn: '15m',
            algorithm: 'RS256',
          },
        };
      },
    }),
    OpaModule,
  ],
  providers: [
    JwtStrategy,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
  ],
  exports: [JwtModule],
})
export class AuthModule {}