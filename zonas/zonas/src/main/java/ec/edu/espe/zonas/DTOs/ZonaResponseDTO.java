package ec.edu.espe.zonas.DTOs;

import java.util.UUID;

import ec.edu.espe.zonas.entidades.TipoZona;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Schema(description = "DTO para mostrar información de una zona")
public class ZonaResponseDTO {

    @Schema(description = "ID único de la zona",
            example = "123e4567-e89b-12d3-a456-426614174000")
    private UUID idZona;

    @Schema(description = "Nombre de la zona",
            example = "Zona Norte")
    private String nombre;

    @Schema(description = "Código identificador de la zona",
            example = "ZN-001")
    private String codigo;

    @Schema(description = "Descripción de la zona",
            example = "Zona ubicada en el sector norte del estacionamiento")
    private String descripcion;

    @Schema(description = "Estado de la zona (1=activo, 0=inactivo)",
            example = "1",
            allowableValues = {"0", "1"})
    private int estado;

    @Schema(description = "Tipo de zona",
            example = "REGULAR")
    private TipoZona tipoZona;

    @Min(1)
    @Max(100)
    @Schema(description = "Capacidad máxima de la zona",
            example = "20")
    private int capacidad;

    @Schema(description = "Fecha de creación de la zona",
            example = "2024-01-15T10:30:00")
    private LocalDateTime fechaCreacion;

    @Schema(description = "Fecha de última modificación",
            example = "2024-01-20T15:45:00")
    private LocalDateTime fechaModificacion;
}