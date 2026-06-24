import { Asignacion } from '../entities/asignacion.entity';
import { CreateAsignacionDto } from '../dto/create-asignacion.dto';

/**
 * Factory de Asignaciones.
 * SOLID - Open/Closed Principle (OCP):
 * Se puede extender con nuevos tipos de asignación sin modificar este factory.
 * Mismo patrón que practica_clase (FactoryPersonas, FactoryVehiculos).
 */
export class FactoryAsignacion {
    /**
     * Crea una nueva instancia de Asignacion a partir de un DTO validado.
     * Centraliza la lógica de construcción de la entidad.
     */
    static crear(dto: CreateAsignacionDto): Asignacion {
        const asignacion = new Asignacion();
        asignacion.userId = dto.userId.trim().toLowerCase();
        asignacion.vehicleId = dto.vehicleId.trim().toLowerCase();
        asignacion.descripcion = dto.descripcion?.trim() ?? null;
        asignacion.estado = 1; // Activo por defecto al crear
        return asignacion;
    }
}
