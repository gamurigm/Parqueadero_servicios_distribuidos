package ec.edu.espe.zonas.Servicios;

import java.util.List;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

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
    Page<ZonaResponseDTO> listarZonas(Pageable pageable);

    ZonaResponseDTO crearZona(ZonaRequestDTO req, String ip, String mac);

    ZonaResponseDTO actualizarZona(UUID idZona, ZonaRequestDTO req, String ip, String mac);

    String eliminarZona(UUID idZona, String ip, String mac);

    String activarDesactivar(UUID idZona, boolean forzar, String ip, String mac);
}
