"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtAuthGuard = exports.IS_PUBLIC_KEY = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const core_1 = require("@nestjs/core");
const opa_service_1 = require("../../opa/opa.service");
const resource_decorator_1 = require("../../opa/decorators/resource.decorator");
const action_decorator_1 = require("../../opa/decorators/action.decorator");
exports.IS_PUBLIC_KEY = 'isPublic';
let JwtAuthGuard = class JwtAuthGuard extends (0, passport_1.AuthGuard)('jwt') {
    constructor(reflector, opaService) {
        super();
        this.reflector = reflector;
        this.opaService = opaService;
    }
    async canActivate(context) {
        const isPublic = this.reflector.getAllAndOverride(exports.IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (isPublic)
            return true;
        const isJwtValid = await super.canActivate(context);
        if (!isJwtValid) {
            return false;
        }
        const req = context.switchToHttp().getRequest();
        const user = req.user;
        const overrideResource = this.reflector.getAllAndOverride(resource_decorator_1.RESOURCE_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        const overrideAction = this.reflector.getAllAndOverride(action_decorator_1.ACTION_KEY, [
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
        const input = {
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
            throw new common_1.ForbiddenException('Access denied by OPA');
        }
        return true;
    }
};
exports.JwtAuthGuard = JwtAuthGuard;
exports.JwtAuthGuard = JwtAuthGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector,
        opa_service_1.OpaService])
], JwtAuthGuard);
//# sourceMappingURL=jwt-auth.guard.js.map