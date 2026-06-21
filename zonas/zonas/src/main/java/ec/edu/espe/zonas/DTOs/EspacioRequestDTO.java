package ec.edu.espe.zonas.DTOs;

import java.util.UUID;

import ec.edu.espe.zonas.entidades.TipoEspacio;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Schema(description = "DTO para crear o actualizar un espacio")
public class EspacioRequestDTO {

    @NotNull(message = "El ID de la zona es obligatorio")
    @Schema(description = "ID de la zona a la que pertenece el espacio", 
            example = "123e4567-e89b-12d3-a456-426614174000", 
            required = true)
    private UUID idZona;

    @Size(max = 200, message = "La descripción no puede exceder los 200 caracteres")
    @Pattern(regexp = "^[a-zA-Z0-9 áéíóúÁÉÍÓÚñÑ.,;:()-]*$", message = "La descripción contiene caracteres inválidos")
    @Schema(description = "Descripción adicional del espacio", 
            example = "Espacio cerca de la entrada principal")
    private String descripcion;

    @NotNull(message = "El tipo de espacio es obligatorio. Valores aceptados: AUTO, MOTO, BUSETA, DISCAPACITADOS")
    @Schema(description = "Tipo de espacio", 
            example = "AUTO", 
            required = true,
            allowableValues = {"AUTO", "MOTO", "BUSETA", "DISCAPACITADOS"})
    private TipoEspacio tipoEspacio;

    @JsonIgnore
    private String codigo;
}