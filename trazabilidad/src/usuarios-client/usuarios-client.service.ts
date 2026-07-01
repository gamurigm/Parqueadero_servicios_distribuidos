import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

/**
 * Cliente HTTP para el Microservicio de Usuarios.
 * Valida la existencia de los propietarios antes de asignarles un vehículo.
 */
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

    /**
     * Valida si un usuario existe en la tabla de usuarios y tiene el rol de "Propietario".
     */
    async validarPropietario(userId: string): Promise<any> {
        try {
            // 1. Consultar en la API (usuarios tabla usuarios!)
            const urlUsuario = `${this.usuariosBaseUrl}/usuario/${userId}`;
            this.logger.log(`Validando usuario en API Usuarios (tabla usuarios): ${urlUsuario}`);
            const resUsuario = await firstValueFrom(this.httpService.get(urlUsuario));
            
            if (!resUsuario.data || !resUsuario.data.active) {
                throw new NotFoundException(`El usuario con ID ${userId} no está activo en el sistema`);
            }

            // 2. Obtener todos los roles y buscar el rol "Propietario"
            const urlRoles = `${this.usuariosBaseUrl}/roles`;
            const resRoles = await firstValueFrom(this.httpService.get(urlRoles));
            const roles: any[] = resRoles.data;
            const rolPropietario = roles.find(r => r.nombre.toLowerCase().includes('propietario'));

            if (!rolPropietario) {
                // Si el rol no existe, logueamos pero podemos dejar pasar o rechazar
                this.logger.warn('El rol "Propietario" no está definido en el sistema de roles.');
            } else {
                // 3. Verificar si el usuario tiene asignado el rol "Propietario"
                const urlRolesUsuario = `${this.usuariosBaseUrl}/roles-Usuario/usuarios/${userId}`;
                const resRolesUsuario = await firstValueFrom(this.httpService.get(urlRolesUsuario));
                const rolesAsignados: any[] = resRolesUsuario.data;

                const tieneRol = rolesAsignados.some(
                    (asignacion) => asignacion.id_rol === rolPropietario.id && asignacion.activo === true
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
            throw new Error('Servicio de usuarios no disponible para validación');
        }
    }

    /**
     * Obtiene los datos de un usuario por su ID para enriquecer la trazabilidad.
     * A diferencia de validarPropietario, no lanza excepciones - retorna null si falla.
     *
     * @param userId - UUID del usuario
     * @returns Datos del usuario o null si no se pudo obtener
     */
    async obtenerUsuario(userId: string): Promise<any | null> {
        try {
            const urlUsuario = `${this.usuariosBaseUrl}/usuario/${userId}`;
            this.logger.log(`Consultando usuario para trazabilidad: ${urlUsuario}`);
            const resUsuario = await firstValueFrom(this.httpService.get(urlUsuario));
            return resUsuario.data ?? null;
        } catch (error) {
            this.logger.warn(`No se pudo obtener el usuario ${userId}: ${error.message}`);
            return null;
        }
    }
}
