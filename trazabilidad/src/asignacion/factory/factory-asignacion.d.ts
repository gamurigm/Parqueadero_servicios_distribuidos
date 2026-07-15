import { Asignacion } from '../entities/asignacion.entity';
import { CreateAsignacionDto } from '../dto/create-asignacion.dto';
export declare class FactoryAsignacion {
    static crear(dto: CreateAsignacionDto): Asignacion;
}
