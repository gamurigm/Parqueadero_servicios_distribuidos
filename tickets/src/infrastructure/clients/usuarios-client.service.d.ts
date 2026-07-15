import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { IUsuariosClient, VehiculoInfo } from '../../application/ports/usuarios-client.interface';
export declare class UsuariosClientService implements IUsuariosClient {
    private readonly httpService;
    private readonly configService;
    private readonly logger;
    private readonly usuariosBaseUrl;
    private readonly trazabilidadBaseUrl;
    constructor(httpService: HttpService, configService: ConfigService);
    obtenerVehiculosPorCedula(cedula: string, authHeader?: string): Promise<VehiculoInfo[]>;
    private obtenerPersonaPorCedula;
}
