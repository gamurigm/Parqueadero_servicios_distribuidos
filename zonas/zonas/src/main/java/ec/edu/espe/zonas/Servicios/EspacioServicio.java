package ec.edu.espe.zonas.Servicios;

import java.util.List;
import java.util.UUID;

import ec.edu.espe.zonas.DTOs.EspacioRequestDTO;
import ec.edu.espe.zonas.DTOs.EspacioResponseDTO;
import ec.edu.espe.zonas.entidades.EstadoEspacio;

public interface EspacioServicio {

    List<EspacioResponseDTO> obtenerEspacios();

    EspacioResponseDTO crearEspacio(EspacioRequestDTO dto);

    EspacioResponseDTO actualizarEspacio(UUID id, EspacioRequestDTO dto);

    void eliminarEspacio(UUID id);

    EspacioResponseDTO cambiarEstado(UUID id, EstadoEspacio estado);

    List<EspacioResponseDTO> obtenerEspaciosPorEstado(EstadoEspacio estado);

    List<EspacioResponseDTO> obtenerEspaciosPorZonaEstado(UUID idZona, EstadoEspacio estado);

    List<EspacioResponseDTO> obtenerEspaciosPorZona(UUID idZona);

    void cambiarActivo(UUID id, boolean activo);

}
