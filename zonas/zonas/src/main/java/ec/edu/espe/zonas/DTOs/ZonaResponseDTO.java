package ec.edu.espe.zonas.DTOs;

import java.util.UUID;

import ec.edu.espe.zonas.entidades.TipoZona;
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
public class ZonaResponseDTO {

    private UUID idZona;
    private String nombre;
    private String codigo;
    private String descripcion;

    private int estado;
    private TipoZona tipoZona;

    @Min(1)
    @Max(100)
    private int capacidad;

    private LocalDateTime fechaCreacion;
    private LocalDateTime fechaModificacion;
}
