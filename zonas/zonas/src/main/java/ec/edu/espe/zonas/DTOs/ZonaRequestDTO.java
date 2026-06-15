package ec.edu.espe.zonas.DTOs;

import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import ec.edu.espe.zonas.entidades.TipoZona;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ZonaRequestDTO {

    @NotBlank(message = "el nombre es obligatorio!")
    @Size(min = 1, max = 32, message = "El nombre debe tener entre 1 y 32 catacteres")

    private String nombre;
    private String descripcion;

    @Enumerated(EnumType.STRING)
    private TipoZona tipoZona;

    @Min(value = 1, message = "La capacidad debe ser como mínimo 1 espacio")
    @Max(value = 100, message = "La capacidad no puede exceder los 100 espacios")
    private int capacidad;

}
