import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import * as fs from 'fs';
<<<<<<< HEAD
import * as path from 'path';
=======
>>>>>>> c1fcd81203b82c3c3faab7c399f9c07c1e843b32
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { OpaModule } from '../opa/opa.module';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    OpaModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
<<<<<<< HEAD
      useFactory: () => {
        const publicKey = fs.readFileSync(
          path.resolve(__dirname, '../../jwt-keys/jwt-public.pem'),
          'utf-8',
        );
        return {
          publicKey,
          signOptions: {
=======
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
>>>>>>> c1fcd81203b82c3c3faab7c399f9c07c1e843b32
            algorithm: 'RS256',
          },
        };
      },
    }),
    OpaModule,
  ],
<<<<<<< HEAD
  providers: [
    JwtStrategy,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
  ],
  exports: [JwtModule],
=======
  providers: [JwtStrategy, JwtAuthGuard],
  exports: [JwtModule, PassportModule, JwtStrategy, JwtAuthGuard],
>>>>>>> c1fcd81203b82c3c3faab7c399f9c07c1e843b32
})
export class AuthModule {}