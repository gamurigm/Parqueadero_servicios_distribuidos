package ec.edu.espe.zonas.Servicios.Impl;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import ec.edu.espe.zonas.DTOs.EspacioRequestDTO;
import ec.edu.espe.zonas.DTOs.EspacioResponseDTO;
import ec.edu.espe.zonas.Servicios.EspacioServicio;
import ec.edu.espe.zonas.entidades.Espacio;
import ec.edu.espe.zonas.entidades.EstadoEspacio;
import ec.edu.espe.zonas.entidades.Zona;
import ec.edu.espe.zonas.repositorios.EspacioRepositorio;
import ec.edu.espe.zonas.repositorios.ZonaRepositorio;
import ec.edu.espe.zonas.utils.UtilsMappers;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class EspacioServicioImpl implements EspacioServicio {

    private final EspacioRepositorio repositorioEspacio;
    private final ZonaRepositorio zonaRepositorio;
    private final UtilsMappers mapper;

    @Override
    @Transactional(readOnly = true)
    public List<EspacioResponseDTO> obtenerEspacios() {
        return repositorioEspacio.findAll().stream()
                .map(mapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public EspacioResponseDTO crearEspacio(EspacioRequestDTO dto) {

        Zona objZona = zonaRepositorio.findById(dto.getIdZona())
                .orElseThrow(() -> new RuntimeException("Zona no encontrada con id: " + dto.getIdZona()));

        // Validar capacidad de la zona
        long numeroEspaciosActuales = repositorioEspacio.countByZonaId(objZona.getId());
        if (numeroEspaciosActuales >= objZona.getCapacidad()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                "No se pueden asignar más espacios. La zona ha alcanzado su capacidad máxima de " + objZona.getCapacidad());
        }

        Espacio nuevoEspacio = mapper.toEntity(dto);
        nuevoEspacio.setZona(objZona);
        nuevoEspacio.setEstado(EstadoEspacio.DISPONIBLE);
        
        // Generar código de espacio
        String codigoGenerado = objZona.getCodigo() + "-ESP-" + String.format("%03d", numeroEspaciosActuales + 1);
        nuevoEspacio.setCodigo(codigoGenerado);
        
        nuevoEspacio.setFechaCreacion(LocalDateTime.now());
        nuevoEspacio.setFechaModificacion(LocalDateTime.now());

        Espacio espacioGuardado = repositorioEspacio.save(nuevoEspacio);

        return mapper.toResponseDTO(espacioGuardado);

    }

    @Override
    public EspacioResponseDTO actualizarEspacio(UUID id, EspacioRequestDTO dto) {
        Espacio espacio = repositorioEspacio.findById(id)
                .orElseThrow(() -> new RuntimeException("Espacio no encontrado con id: " + id));

        Zona objZona = zonaRepositorio.findById(dto.getIdZona())
                .orElseThrow(() -> new RuntimeException("Zona no encontrada con id: " + dto.getIdZona()));

        espacio.setCodigo(dto.getCodigo());
        espacio.setDescripcion(dto.getDescripcion());
        espacio.setTipoEspacio(dto.getTipoEspacio());
        espacio.setZona(objZona);
        espacio.setFechaModificacion(LocalDateTime.now());

        // Nota: Si deseas actualizar el estado aquí también, puedes descomentar la siguiente línea:
        // espacio.setEstado(dto.getEstado());

        Espacio espacioGuardado = repositorioEspacio.save(espacio);
        return mapper.toResponseDTO(espacioGuardado);
    }

    @Override
    public void eliminarEspacio(UUID id) {
        Espacio espacio = repositorioEspacio.findById(id)
                .orElseThrow(() -> new RuntimeException("Espacio no encontrado con id: " + id));
        
        repositorioEspacio.delete(espacio);
    }

    @Override
    public EspacioResponseDTO cambiarEstado(UUID id, EstadoEspacio estado) {
        // Validación: el nuevo estado no puede ser nulo
        if (estado == null) {
            throw new IllegalArgumentException("El estado no puede ser nulo");
        }

        // Validación: el espacio debe existir
        Espacio espacio = repositorioEspacio.findById(id)
                .orElseThrow(() -> new RuntimeException("Espacio no encontrado con id: " + id));

        // Validación: el espacio debe estar activo para poder cambiar su estado
        if (!espacio.isActivo()) {
            throw new IllegalStateException("No se puede cambiar el estado de un espacio inactivo");
        }

        // Validación: el nuevo estado no puede ser igual al actual
        if (espacio.getEstado() == estado) {
            throw new IllegalArgumentException("El espacio ya se encuentra en estado: " + estado);
        }

        espacio.setEstado(estado);
        espacio.setFechaModificacion(LocalDateTime.now());

        Espacio espacioGuardado = repositorioEspacio.save(espacio);
        return mapper.toResponseDTO(espacioGuardado);
    }

    @Override
    @Transactional(readOnly = true)
    public List<EspacioResponseDTO> obtenerEspaciosPorEstado(EstadoEspacio estado) {
        return repositorioEspacio.findByEstado(estado).stream()
                .map(mapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<EspacioResponseDTO> obtenerEspaciosPorZonaEstado(UUID idZona, EstadoEspacio estado) {
        return repositorioEspacio.findByZonaIdAndEstado(idZona, estado).stream()
                .map(mapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<EspacioResponseDTO> obtenerEspaciosPorZona(UUID idZona) {
        return repositorioEspacio.findByZonaId(idZona).stream()
                .map(mapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void cambiarActivo(UUID id, boolean activo) {
        Espacio espacio = repositorioEspacio.findById(id)
                .orElseThrow(() -> new RuntimeException("Espacio no encontrado con id: " + id));
        espacio.setActivo(activo);
        espacio.setFechaModificacion(LocalDateTime.now());
        repositorioEspacio.save(espacio);
    }

}