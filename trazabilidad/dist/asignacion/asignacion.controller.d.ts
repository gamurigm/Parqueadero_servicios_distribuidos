import { Request } from 'express';
import { AsignacionService } from './asignacion.service';
import { TrazabilidadService } from '../trazabilidad/trazabilidad.service';
import { CreateAsignacionDto } from './dto/create-asignacion.dto';
import { UpdateAsignacionDto } from './dto/update-asignacion.dto';
export declare class AsignacionController {
    private readonly asignacionService;
    private readonly trazabilidadService;
    constructor(asignacionService: AsignacionService, trazabilidadService: TrazabilidadService);
    crear(dto: CreateAsignacionDto, authHeader?: string, req?: Request, mac?: string): Promise<any>;
    listar(authHeader?: string): Promise<any[]>;
    obtenerFlota(userId: string, authHeader?: string): Promise<any[]>;
    listarTrazabilidad(authHeader?: string): Promise<any[]>;
    listarTrazabilidadPorPropietario(userId: string, authHeader?: string): Promise<any[]>;
    listarTrazabilidadPorAsignacion(userId: string, vehicleId: string, authHeader?: string): Promise<any[]>;
    buscarPorClave(userId: string, vehicleId: string, authHeader?: string): Promise<any>;
    actualizar(userId: string, vehicleId: string, dto: UpdateAsignacionDto, authHeader?: string, req?: Request, mac?: string): Promise<any>;
    eliminar(userId: string, vehicleId: string, authHeader?: string, req?: Request, mac?: string): Promise<{
        message: string;
    }>;
}
