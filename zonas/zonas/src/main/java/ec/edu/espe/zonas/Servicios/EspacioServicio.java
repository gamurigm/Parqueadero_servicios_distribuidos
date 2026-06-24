package ec.edu.espe.zonas.Servicios;

import java.util.List;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import ec.edu.espe.zonas.DTOs.EspacioRequestDTO;
import ec.edu.espe.zonas.DTOs.EspacioResponseDTO;
import ec.edu.espe.zonas.entidades.EstadoEspacio;

public interface EspacioServicio {

    List<EspacioResponseDTO> obtenerTodosLosEspacios();

    Page<EspacioResponseDTO> obtenerEspacios(Pageable pageable);

    EspacioResponseDTO crearEspacio(EspacioRequestDTO dto);

    EspacioResponseDTO actualizarEspacio(UUID id, EspacioRequestDTO dto);

    String eliminarEspacio(UUID id);

    EspacioResponseDTO cambiarEstado(UUID id, EstadoEspacio estado);

    List<EspacioResponseDTO> obtenerEspaciosPorEstado(EstadoEspacio estado);

    List<EspacioResponseDTO> obtenerEspaciosPorZonaEstado(UUID idZona, EstadoEspacio estado);

    List<EspacioResponseDTO> obtenerEspaciosPorZona(UUID idZona);

    void cambiarActivo(UUID id, boolean activo);

    String toggleActivo(UUID id);

    int cambiarActivoMasivo(UUID idZona, boolean activo);

}
