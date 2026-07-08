import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class UsuariosClientService {
    private readonly logger = new Logger(UsuariosClientService.name);
    private readonly usuariosBaseUrl: string;

    constructor(
        private readonly httpService: HttpService,
        private readonly configService: ConfigService,
    ) {
        this.usuariosBaseUrl = this.configService.get<string>(
            'USUARIOS_SERVICE_URL',
            'http://localhost:5000',
        );
    }

    async validarPropietario(userId: string, authHeader?: string): Promise<any> {
        try {
            const headers = authHeader ? { Authorization: authHeader } : undefined;

            const urlUsuario = `${this.usuariosBaseUrl}/usuario/${userId}`;
            this.logger.log(`Validando usuario en API Usuarios (tabla usuarios): ${urlUsuario}`);
            const resUsuario = await firstValueFrom(this.httpService.get(urlUsuario, { headers }));

            if (!resUsuario.data || !resUsuario.data.active) {
                throw new NotFoundException(`El usuario con ID ${userId} no esta activo en el sistema`);
            }

            const urlRoles = `${this.usuariosBaseUrl}/roles`;
            const resRoles = await firstValueFrom(this.httpService.get(urlRoles, { headers }));
            const roles: any[] = resRoles.data;
            const rolesPropietario = roles.filter((r) => String(r.nombre ?? '').toLowerCase().includes('propietario'));

            if (rolesPropietario.length === 0) {
                this.logger.warn('El rol "Propietario" no esta definido en el sistema de roles.');
            } else {
                const urlRolesUsuario = `${this.usuariosBaseUrl}/roles-Usuario/usuarios/${userId}`;
                const resRolesUsuario = await firstValueFrom(this.httpService.get(urlRolesUsuario, { headers }));
                const rolesAsignados: any[] = resRolesUsuario.data;

                const tieneRol = rolesAsignados.some((asignacion) =>
                    asignacion.activo === true && rolesPropietario.some((rol) => rol.id === asignacion.id_rol),
                );

                if (!tieneRol) {
                    throw new NotFoundException(`El usuario ${userId} existe, pero no es de tipo "Propietario"`);
                }
            }

            return resUsuario.data;
        } catch (error) {
            this.logger.error(`Error al consultar propietario ${userId}: ${error.message}`);

            if (error instanceof NotFoundException) {
                throw error;
            }

            if (error.response?.status === 404) {
                throw new NotFoundException(`El usuario con ID ${userId} no existe en la tabla de usuarios o no tiene roles.`);
            }
            throw new Error('Servicio de usuarios no disponible para validacion');
        }
    }

    async obtenerUsuario(userId: string, authHeader?: string): Promise<any | null> {
        try {
            const urlUsuario = `${this.usuariosBaseUrl}/usuario/${userId}`;
            this.logger.log(`Consultando usuario para trazabilidad: ${urlUsuario}`);
            const headers = authHeader ? { Authorization: authHeader } : undefined;
            const resUsuario = await firstValueFrom(this.httpService.get(urlUsuario, { headers }));
            return resUsuario.data ?? null;
        } catch (error) {
            this.logger.warn(`No se pudo obtener el usuario ${userId}: ${error.message}`);
            return null;
        }
    }
}
