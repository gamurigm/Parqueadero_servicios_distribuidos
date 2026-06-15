package ec.edu.espe.zonas.Servicios;

import java.util.List;
import java.util.UUID;

import ec.edu.espe.zonas.DTOs.ZonaRequestDTO;
import ec.edu.espe.zonas.DTOs.ZonaResponseDTO;

public interface ZonaServicio {

    /**
     * Regla de negocio para generar los códigos de las zonas.
     * Consistirá en la primera letra del TipoZona (V, R, E, I, P)
     * seguida de un número secuencial de 3 dígitos (ej. V001, R002).
     */
    String generarCodigoZona(ZonaRequestDTO req);

    // OPERACIONES CRUD
    List<ZonaResponseDTO> listarZonas();

    ZonaResponseDTO crearZona(ZonaRequestDTO req);

    ZonaResponseDTO actualizarZona(UUID idZona, ZonaRequestDTO req);

    void eliminarZona(UUID idZona);

    Boolean activarDesactivar(UUID idZona);
}
