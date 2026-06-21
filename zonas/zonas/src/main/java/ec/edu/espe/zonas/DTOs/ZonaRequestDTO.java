package ec.edu.espe.zonas.DTOs;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
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
@Schema(description = "DTO para crear o actualizar una zona")
public class ZonaRequestDTO {

    @NotBlank(message = "el nombre es obligatorio!")
    @Size(min = 3, max = 32, message = "El nombre debe tener entre 3 y 32 caracteres")
    @Pattern(regexp = "^[a-zA-Z0-9 áéíóúÁÉÍÓÚñÑ]+$", message = "El nombre contiene caracteres inválidos")
    @Schema(description = "Nombre de la zona",
            example = "Zona Norte",
            required = true,
            minLength = 3,
            maxLength = 32)
    private String nombre;

    @Size(max = 500, message = "La descripción no puede exceder los 500 caracteres")
    @Pattern(regexp = "^[a-zA-Z0-9 áéíóúÁÉÍÓÚñÑ.,;:()-]*$", message = "La descripción contiene caracteres inválidos")
    @Schema(description = "Descripción de la zona",
            example = "Zona ubicada en el sector norte del estacionamiento",
            maxLength = 500)
    private String descripcion;

    @NotNull(message = "El tipo de zona es obligatorio. Valores: VIP, REGULAR, EXTERNO, INTERNO, PREFERENCIAL")
    @Enumerated(EnumType.STRING)
    @Schema(description = "Tipo de zona",
            example = "REGULAR",
            required = true,
            allowableValues = {"VIP", "REGULAR", "EXTERNO", "INTERNO", "PREFERENCIAL"})
    private TipoZona tipoZona;

    @Min(value = 1, message = "La capacidad debe ser como mínimo 1 espacio")
    @Max(value = 100, message = "La capacidad no puede exceder los 100 espacios")
    @Schema(description = "Capacidad máxima de la zona en número de espacios",
            example = "20",
            minimum = "1",
            maximum = "100")
    private int capacidad;
}