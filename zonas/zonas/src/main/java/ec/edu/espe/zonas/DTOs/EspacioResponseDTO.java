package ec.edu.espe.zonas.DTOs;

import java.time.LocalDateTime;
import java.util.UUID;

import ec.edu.espe.zonas.entidades.EstadoEspacio;
import ec.edu.espe.zonas.entidades.TipoEspacio;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Schema(description = "DTO para mostrar información de un espacio")
public class EspacioResponseDTO {

    @Schema(description = "ID único del espacio",
            example = "123e4567-e89b-12d3-a456-426614174000")
    private UUID id;

    @Schema(description = "Código identificador del espacio",
            example = "ESP-A1-001")
    private String codigo;

    @Schema(description = "Descripción del espacio",
            example = "Espacio cerca de la entrada principal")
    private String descripcion;

    @Schema(description = "Tipo de espacio",
            example = "AUTO")
    private TipoEspacio tipoEspacio;

    @Schema(description = "Indica si el espacio está activo",
            example = "true")
    private boolean activo;

    @Schema(description = "Estado actual del espacio",
            example = "DISPONIBLE")
    private EstadoEspacio estado;

    @Schema(description = "ID de la zona a la que pertenece",
            example = "223e4567-e89b-12d3-a456-426614174001")
    private UUID idZona;

    @Schema(description = "Nombre de la zona",
            example = "Zona Norte")
    private String nombreZona;

    @Schema(description = "Fecha de creación del espacio",
            example = "2024-01-15T10:30:00")
    private LocalDateTime fechaCreacion;

    @Schema(description = "Fecha de última modificación",
            example = "2024-01-20T15:45:00")
    private LocalDateTime fechaModificacion;
}