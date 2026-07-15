import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import * as fs from 'fs';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { User } from '../usuario/entities/usuario.entity';
import { RolesUsuarios } from '../roles_usuario/entities/roles_usuario.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import { ActiveToken } from './entities/active-token.entity';
import { Person } from '../persona/entities/persona.entity';
import { Role } from '../roles/entities/role.entity';
import { UsuarioModule } from '../usuario/usuario.module';
import { PersonaModule } from '../persona/persona.module';
import { RolesUsuarioModule } from '../roles_usuario/roles_usuario.module';
import { OpaModule } from '../opa/opa.module';
import { EventPublisher } from '../event-publisher.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([RefreshToken, ActiveToken, User, Person, RolesUsuarios, Role]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        let privateKey = config.get<string>('JWT_SECRET', 'super-secret-key-change-in-production');
        try {
          // Intentar leer la llave privada desde el archivo montado
          privateKey = fs.readFileSync('/keys/private.pem', 'utf8');
        } catch (error) {
          console.warn('No se pudo leer /keys/private.pem. Asegúrese de montar la llave o definir la variable.');
        }
        
        return {
          privateKey: privateKey,
          signOptions: {
            algorithm: 'RS256',
            expiresIn: config.get<any>('JWT_EXPIRATION', '15m'),
          },
        };
      },
    }),
    forwardRef(() => UsuarioModule),
    PersonaModule,
    RolesUsuarioModule,
    OpaModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    EventPublisher,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
  ],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
