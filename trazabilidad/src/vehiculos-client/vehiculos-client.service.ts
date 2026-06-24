import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

/**
 * DTO de respuesta del microservicio de Vehículos.
 * Representa la estructura que retorna GET /vehiculos/:id
 */
export interface VehiculoDetalle {
    id: string;
    tipo: string;       // Moto | Automóvil | Camioneta
    categoria: string;  // Eléctrico | Híbrido | Combustión
    marca?: string;
    modelo?: string;
    placa?: string;
    [key: string]: any; // Campos adicionales que el servicio pueda retornar
}

/**
 * Cliente HTTP para el Microservicio de Vehículos.
 * RF3: Necesario para obtener tipo y categoría de vehículo al consultar la flota.
 * SOLID - SRP: Solo se encarga de comunicarse con el servicio externo de vehículos.
 * SOLID - DIP: Inyecta HttpService (abstracción), no hace llamadas directas.
 */
@Injectable()
export class VehiculosClientService {
    private readonly logger = new Logger(VehiculosClientService.name);
    private readonly vehiculosBaseUrl: string;

    constructor(
        private readonly httpService: HttpService,
        private readonly configService: ConfigService,
    ) {
        this.vehiculosBaseUrl = this.configService.get<string>(
            'VEHICULOS_SERVICE_URL',
            'http://localhost:3000',
        );
    }

    /**
     * Obtiene los detalles de un vehículo por su ID desde el microservicio de Vehículos.
     * RF3: Necesario para enriquecer la respuesta de flota con tipo y categoría.
     *
     * @param vehicleId - UUID del vehículo
     * @returns Detalles del vehículo o null si no se pudo obtener
     */
    async getVehiculo(vehicleId: string): Promise<VehiculoDetalle | null> {
        try {
            const url = `${this.vehiculosBaseUrl}/vehiculos/${vehicleId}`;
            this.logger.log(`Consultando vehículo: ${url}`);

            const response = await firstValueFrom(
                this.httpService.get<VehiculoDetalle>(url),
            );

            return response.data;
        } catch (error) {
            this.logger.warn(
                `No se pudo obtener el vehículo ${vehicleId}: ${error.message}`,
            );
            // Retorna null en lugar de lanzar excepción para no bloquear la consulta de flota
            return null;
        }
    }

    /**
     * Verifica que el microservicio de Vehículos esté disponible.
     */
    async checkHealth(): Promise<boolean> {
        try {
            await firstValueFrom(
                this.httpService.get(`${this.vehiculosBaseUrl}/vehiculos`),
            );
            return true;
        } catch {
            return false;
        }
    }
}
