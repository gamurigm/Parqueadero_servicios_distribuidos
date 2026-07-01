import { Injectable, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { OpaService, OpaInput } from '../../opa/opa.service';
import { RESOURCE_KEY } from '../../opa/decorators/resource.decorator';
import { ACTION_KEY } from '../../opa/decorators/action.decorator';

export const IS_PUBLIC_KEY = 'isPublic';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private reflector: Reflector,
    private opaService: OpaService
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    // Primero validamos el JWT
    const isJwtValid = await super.canActivate(context);
    if (!isJwtValid) {
      return false;
    }

    // Si el JWT es válido, extraemos el usuario y evaluamos con OPA
    const req = context.switchToHttp().getRequest();
    const user = req.user;

    // Determinar recurso y acción. Soporta override con decoradores.
    const overrideResource = this.reflector.getAllAndOverride<string>(RESOURCE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    const overrideAction = this.reflector.getAllAndOverride<string>(ACTION_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Parse resource from route path (e.g. /usuarios -> usuarios)
    const defaultResource = req.route.path.split('/')[1] || 'root';
    
    // Mapeo básico de métodos HTTP a acciones
    const methodMap = {
      GET: 'read',
      POST: 'create',
      PUT: 'update',
      PATCH: 'update',
      DELETE: 'delete',
    };
    const defaultAction = methodMap[req.method] || 'read';

    const input: OpaInput = {
      token: {
        iss: user.iss,
        sub: user.id,
        aud: user.aud,
        jti: user.jti,
      },
      user: {
        id: user.id,
        username: user.username,
        roles: user.roles || [],
      },
      resource: overrideResource || `${defaultResource}.${defaultAction}`,
      action: overrideAction || defaultAction,
      context: {
        ip: req.ip,
        method: req.method,
        path: req.originalUrl,
      },
    };

    const isAllowed = await this.opaService.checkPermission(input);
    if (!isAllowed) {
      throw new ForbiddenException('Access denied by OPA');
    }

    return true;
  }
}
