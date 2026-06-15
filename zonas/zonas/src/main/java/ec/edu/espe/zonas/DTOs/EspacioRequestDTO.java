package ec.edu.espe.zonas.DTOs;

import java.util.UUID;

import ec.edu.espe.zonas.entidades.TipoEspacio;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class EspacioRequestDTO {

    @NotNull(message = "El ID de la zona es obligatorio")
    private UUID idZona;

    @Size(max = 200, message = "La descripción no puede exceder los 200 caracteres")
    private String descripcion;

    @NotNull(message = "El tipo de espacio es obligatorio. Valores aceptados: AUTO, MOTO, DISCAPACITADOS")
    private TipoEspacio tipoEspacio;

    private String codigo;
}
