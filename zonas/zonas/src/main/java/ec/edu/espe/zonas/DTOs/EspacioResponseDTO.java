package ec.edu.espe.zonas.DTOs;

import java.time.LocalDateTime;
import java.util.UUID;

import ec.edu.espe.zonas.entidades.EstadoEspacio;
import ec.edu.espe.zonas.entidades.TipoEspacio;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class EspacioResponseDTO {
    private UUID id;
    private String codigo;
    private String descripcion;
    private TipoEspacio tipoEspacio;
    private boolean activo;
    private EstadoEspacio estado;
    private UUID idZona;
    private String nombreZona;
    private LocalDateTime fechaCreacion;
    private LocalDateTime fechaModificacion;
}
