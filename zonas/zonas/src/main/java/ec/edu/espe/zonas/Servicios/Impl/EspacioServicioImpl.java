package ec.edu.espe.zonas.Servicios.Impl;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

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
import ec.edu.espe.zonas.utils.SanitizadorEntradas;
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
    public Page<EspacioResponseDTO> obtenerEspacios(Pageable pageable) {
        return repositorioEspacio.findAll(pageable)
                .map(mapper::toResponseDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public List<EspacioResponseDTO> obtenerTodosLosEspacios() {
        return repositorioEspacio.findAll().stream()
                .map(mapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public EspacioResponseDTO crearEspacio(EspacioRequestDTO dto) {

        Zona objZona = zonaRepositorio.findById(dto.getIdZona())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Zona no encontrada con id: " + dto.getIdZona()));

        if (objZona.getEstado() != 1) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                "No se pueden crear espacios en una zona inactiva");
        }

        if (dto.getDescripcion() != null) {
            dto.setDescripcion(SanitizadorEntradas.trimYNormalizar(dto.getDescripcion()));
            if (SanitizadorEntradas.contieneHtmlOScripts(dto.getDescripcion())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                    "La descripción contiene contenido potencialmente peligroso");
            }
        }

        // Validar capacidad de la zona
        long numeroEspaciosActuales = repositorioEspacio.countByZonaId(objZona.getId());
        if (numeroEspaciosActuales >= objZona.getCapacidad()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                "No se pueden asignar más espacios. La zona ha alcanzado su capacidad máxima de " + objZona.getCapacidad());
        }

        Espacio nuevoEspacio = mapper.toEntity(dto);
        nuevoEspacio.setZona(objZona);
        nuevoEspacio.setEstado(EstadoEspacio.DISPONIBLE);
        
        // Generar código basado en el Último código existente en la zona
        String codigoGenerado = generarCodigoEspacio(objZona);
        nuevoEspacio.setCodigo(codigoGenerado);
        
        nuevoEspacio.setFechaCreacion(LocalDateTime.now());
        nuevoEspacio.setFechaModificacion(LocalDateTime.now());

        Espacio espacioGuardado = repositorioEspacio.save(nuevoEspacio);

        return mapper.toResponseDTO(espacioGuardado);

    }

    /**
     * Genera el código de un espacio basándose en el último código existente en la zona.
     * Si la zona tiene código "VIP-ZN-001" y el último espacio es "VIP-ZN-001-ESP-003",
     * genera "VIP-ZN-001-ESP-004".
     */
    private String generarCodigoEspacio(Zona zona) {
        String prefijo = zona.getCodigo() + "-ESP-";
        java.util.Optional<Espacio> ultimoEspacio = repositorioEspacio.findTopByZonaIdOrderByCodigoDesc(zona.getId());

        int siguienteNumero = 1;
        if (ultimoEspacio.isPresent()) {
            String ultimoCodigo = ultimoEspacio.get().getCodigo();
            String parteNumerica = ultimoCodigo.substring(ultimoCodigo.lastIndexOf("-") + 1);
            try {
                siguienteNumero = Integer.parseInt(parteNumerica) + 1;
            } catch (NumberFormatException e) {
                siguienteNumero = 1;
            }
        }
        return prefijo + String.format("%03d", siguienteNumero);
    }

    @Override
    public EspacioResponseDTO actualizarEspacio(UUID id, EspacioRequestDTO dto) {
        Espacio espacio = repositorioEspacio.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Espacio no encontrado con id: " + id));

        Zona objZona = zonaRepositorio.findById(dto.getIdZona())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Zona no encontrada con id: " + dto.getIdZona()));

        if (!espacio.getZona().getId().equals(objZona.getId()) && espacio.getEstado() == EstadoEspacio.OCUPADO) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "No se puede cambiar la zona de un espacio que está OCUPADO");
        }

        if (dto.getDescripcion() != null) {
            dto.setDescripcion(SanitizadorEntradas.trimYNormalizar(dto.getDescripcion()));
            if (SanitizadorEntradas.contieneHtmlOScripts(dto.getDescripcion())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                    "La descripción contiene contenido potencialmente peligroso");
            }
        }

        // Si cambió de zona, regenerar el código para la nueva zona
        if (!espacio.getZona().getId().equals(objZona.getId())) {
            espacio.setCodigo(generarCodigoEspacio(objZona));
        }

        espacio.setDescripcion(dto.getDescripcion());
        espacio.setTipoEspacio(dto.getTipoEspacio());
        espacio.setZona(objZona);
        espacio.setFechaModificacion(LocalDateTime.now());

        Espacio espacioGuardado = repositorioEspacio.save(espacio);
        return mapper.toResponseDTO(espacioGuardado);
    }

    @Override
    public String eliminarEspacio(UUID id) {
        Espacio espacio = repositorioEspacio.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Espacio no encontrado con id: " + id));
        
        if (espacio.getEstado() == EstadoEspacio.OCUPADO) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "No se puede eliminar un espacio que está OCUPADO");
        }

        String codigoEspacio = espacio.getCodigo();
        String nombreZona = espacio.getZona().getNombre();
        repositorioEspacio.delete(espacio);
        return "Espacio '" + codigoEspacio + "' de la zona '" + nombreZona + "' eliminado exitosamente.";
    }

    @Override
    public EspacioResponseDTO cambiarEstado(UUID id, EstadoEspacio estado) {
        // Validación: el nuevo estado no puede ser nulo
        if (estado == null) {
            throw new IllegalArgumentException("El estado no puede ser nulo");
        }

        // Validación: el espacio debe existir
        Espacio espacio = repositorioEspacio.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Espacio no encontrado con id: " + id));

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
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Espacio no encontrado con id: " + id));
        espacio.setActivo(activo);
        espacio.setFechaModificacion(LocalDateTime.now());
        repositorioEspacio.save(espacio);
    }

    @Override
    @Transactional
    public void toggleActivo(UUID id) {
        Espacio espacio = repositorioEspacio.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Espacio no encontrado con id: " + id));
        espacio.setActivo(!espacio.isActivo());
        espacio.setFechaModificacion(LocalDateTime.now());
        repositorioEspacio.save(espacio);
    }

    @Override
    @Transactional
    public int cambiarActivoMasivo(UUID idZona, boolean activo) {
        return repositorioEspacio.actualizarActivoPorZona(idZona, activo);
    }

}