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
    private opaService: OpaService,
  ) {
    super();
  }

 async canActivate(context: ExecutionContext): Promise<boolean> {
  // 🔥 === NUEVO BLOQUE: Excluir rutas de documentación ===
  const request = context.switchToHttp().getRequest();
  const path = request.url || request.originalUrl || '';
  
  const isDocsPath = 
    path.includes('/docs') || 
    path.includes('/docs-json') || 
    path.includes('/api-docs') ||
    path.includes('/swagger-ui') ||
    path.includes('/v3/api-docs');

  if (isDocsPath) {
    return true; // Permitir acceso sin autenticación
  }

    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const isJwtValid = await super.canActivate(context);
    if (!isJwtValid) {
      return false;
    }

    const req = context.switchToHttp().getRequest();
    const user = req.user;

    const overrideResource = this.reflector.getAllAndOverride<string>(RESOURCE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    const overrideAction = this.reflector.getAllAndOverride<string>(ACTION_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const defaultResource = req.route.path.split('/')[1] || 'root';

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