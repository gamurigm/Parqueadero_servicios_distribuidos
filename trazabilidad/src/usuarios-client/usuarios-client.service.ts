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
     * Valida si una persona (propietario) existe en el microservicio de Usuarios.
     */
    async validarPropietario(userId: string): Promise<any> {
        try {
            const url = `${this.usuariosBaseUrl}/persona/${userId}`;
            this.logger.log(`Validando propietario en API Usuarios: ${url}`);
            
            const response = await firstValueFrom(this.httpService.get(url));
            return response.data;
        } catch (error) {
            this.logger.error(`Error al consultar propietario ${userId}: ${error.message}`);
            if (error.response?.status === 404) {
                throw new NotFoundException(`El propietario con ID ${userId} no existe en el sistema`);
            }
            throw new Error('Servicio de usuarios no disponible para validación');
        }
    }
}
