package ec.edu.espe.zonas.Servicios.Impl;

import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;

import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import ec.edu.espe.zonas.DTOs.ZonaRequestDTO;
import ec.edu.espe.zonas.DTOs.ZonaResponseDTO;
import ec.edu.espe.zonas.Servicios.EspacioServicio;
import ec.edu.espe.zonas.Servicios.ZonaServicio;

import ec.edu.espe.zonas.entidades.Zona;
import ec.edu.espe.zonas.entidades.EstadoEspacio;
import ec.edu.espe.zonas.repositorios.ZonaRepositorio;
import java.util.stream.Collectors;

@Service
public class ZonaServicioImpl implements ZonaServicio {

    private final ZonaRepositorio zonaRepositorio;
    private final EspacioServicio espacioServicio;

    @Autowired
    public ZonaServicioImpl(ZonaRepositorio zonaRepositorio, EspacioServicio espacioServicio) {
        this.zonaRepositorio = zonaRepositorio;
        this.espacioServicio = espacioServicio;
    }

    @Override
    public List<ZonaResponseDTO> listarZonas() {
        return zonaRepositorio.findAll().stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    private ZonaResponseDTO toResponseDTO(Zona zona) {
        return ZonaResponseDTO.builder()
                .idZona(zona.getId())
                .nombre(zona.getNombre())
                .descripcion(zona.getDescripcion())
                .tipoZona(zona.getTipoZona())
                .codigo(zona.getCodigo())
                .estado(zona.getEstado())
                .capacidad(zona.getCapacidad())
                .fechaCreacion(zona.getFechaCreacion())
                .fechaModificacion(zona.getFechaModificacion())
                .build();
    }

    @Override
    public String generarCodigoZona(ZonaRequestDTO req) {
        if (req.getTipoZona() == null) {
            throw new IllegalArgumentException("El TipoZona no puede ser nulo");
        }
        if (req.getNombre() == null || req.getNombre().isBlank()) {
            throw new IllegalArgumentException("El nombre no puede ser nulo");
        }

        // Parte 1: primeras 3 letras del TipoZona → VIP, REG, EXT, INT, PRE...
        String parteTipo = req.getTipoZona().name().substring(0, 3); // e.g. "VIP", "REG"

        // Parte 2: iniciales de las palabras del nombre (solo letras, ignorar números)
        String[] palabras = req.getNombre().trim().split("\\s+");
        StringBuilder iniciales = new StringBuilder();
        for (String p : palabras) {
            if (p.matches("[a-zA-ZáéíóúÁÉÍÓÚñÑ]+")) {
                iniciales.append(Character.toUpperCase(p.charAt(0)));
            }
        }
        if (iniciales.length() < 2 && req.getNombre().replaceAll("[^a-zA-Z]", "").length() >= 2) {
            iniciales.append(req.getNombre().toUpperCase().replaceAll("[^A-Z]", "").charAt(1));
        }
        String parteNombre = iniciales.length() > 0 ? iniciales.toString() : "X"; // e.g. "ZN"

        // Parte 3: número secuencial de 3 dígitos
        long count = zonaRepositorio.countByTipoZona(req.getTipoZona());
        String numero = String.format("%03d", count + 1); // e.g. "001"

        // Código final: TIPO-INICIALES-NNN e.g. "VIP-ZN-001"
        return parteTipo + "-" + parteNombre + "-" + numero;
    }

    @Override
    public ZonaResponseDTO crearZona(ZonaRequestDTO request) {

        if (request.getNombre() == null || request.getNombre().trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "EL NOMBRE ES OBLIGATORIO");
        }
        if (!request.getNombre().matches("^[a-zA-Z0-9 áéíóúÁÉÍÓÚñÑ]+$")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "EL NOMBRE CONTIENE CARACTERES INVÁLIDOS");
        }
        if (request.getCapacidad() <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "LA CAPACIDAD DEBE SER MAYOR A 0");
        }

        if (zonaRepositorio.existsByNombre(request.getNombre()))
            throw new ResponseStatusException(HttpStatus.CONFLICT, "YA EXISTE EL NOMBRE");

        if (zonaRepositorio.existsByCodigo(generarCodigoZona(request)))
            throw new ResponseStatusException(HttpStatus.CONFLICT, "YA EXISTE EL CODIGO");

        Zona objZona = new Zona();
        objZona.setNombre(request.getNombre());
        objZona.setCodigo(generarCodigoZona(request));
        objZona.setDescripcion(request.getDescripcion());
        objZona.setTipoZona(request.getTipoZona());
        objZona.setEstado(1);
        objZona.setCapacidad(request.getCapacidad());
        objZona.setFechaCreacion(java.time.LocalDateTime.now());
        objZona.setFechaModificacion(java.time.LocalDateTime.now());

        Zona saved = zonaRepositorio.save(objZona);
        return toResponseDTO(saved);

    }

    @Override
    public ZonaResponseDTO actualizarZona(UUID idZona, ZonaRequestDTO req) {
        
        if (req.getNombre() == null || req.getNombre().trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "EL NOMBRE ES OBLIGATORIO");
        }
        if (!req.getNombre().matches("^[a-zA-Z0-9 áéíóúÁÉÍÓÚñÑ]+$")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "EL NOMBRE CONTIENE CARACTERES INVÁLIDOS");
        }
        if (req.getCapacidad() <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "LA CAPACIDAD DEBE SER MAYOR A 0");
        }

        Zona zona = zonaRepositorio.findById(idZona)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Zona no encontrada con id: " + idZona));

        zona.setNombre(req.getNombre());
        zona.setDescripcion(req.getDescripcion());
        zona.setTipoZona(req.getTipoZona());
        zona.setCapacidad(req.getCapacidad());
        zona.setFechaModificacion(java.time.LocalDateTime.now());

        Zona zonaGuardada = zonaRepositorio.save(zona);
        return toResponseDTO(zonaGuardada);
    }

    @Override
    public void eliminarZona(UUID idZona) {
        Zona zona = zonaRepositorio.findById(idZona)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Zona no encontrada con id: " + idZona));

        if (!espacioServicio.obtenerEspaciosPorZona(idZona).isEmpty()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "No se puede eliminar la zona '" + zona.getNombre() + "' porque tiene espacios asignados. Elimine o mueva los espacios primero.");
        }

        zonaRepositorio.delete(zona);
    }

    @Override
    @jakarta.transaction.Transactional
    public Boolean activarDesactivar(UUID idZona) {
        // Validación de entrada: ID no puede ser nulo
        if (idZona == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "El ID de la zona no puede ser nulo");
        }

        // Buscar la zona (debe existir)
        Zona zona = zonaRepositorio.findById(idZona)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Zona no encontrada con id: " + idZona));

        // Guardar el estado actual antes de cambiarlo
        int estadoActual = zona.getEstado();
        int nuevoEstado = estadoActual == 1 ? 0 : 1;

        // Validación de DESACTIVACIÓN: si se va a desactivar (pasar a 0)
        if (nuevoEstado == 0) {
            // Buscar espacios con estado OCUPADO en esta zona usando EspacioServicio
            boolean tieneEspaciosOcupados = !espacioServicio.obtenerEspaciosPorZonaEstado(idZona, EstadoEspacio.OCUPADO)
                    .isEmpty();

            if (tieneEspaciosOcupados) {
                throw new ResponseStatusException(HttpStatus.CONFLICT,
                        "No se puede desactivar la zona '" + zona.getNombre()
                                + "' porque tiene espacios ocupados.");
            }
        }

        // Validación de ACTIVACIÓN: si se va a activar (pasar a 1)
        if (nuevoEstado == 1) {
            // Debe tener por lo menos un espacio asignado, consultando via EspacioServicio
            if (espacioServicio.obtenerEspaciosPorZona(idZona).isEmpty()) {
                throw new ResponseStatusException(HttpStatus.CONFLICT,
                        "No se puede activar la zona '" + zona.getNombre()
                                + "' porque no tiene espacios asignados.");
            }
        }

        // Cambiar el estado en la base de datos (campo activo pasa a false o viceversa)
        zona.setEstado(nuevoEstado);
        zona.setFechaModificacion(java.time.LocalDateTime.now());

        // Efecto Cascada: Actualizar todos los espacios de la zona usando
        // EspacioServicio
        boolean estaActiva = (nuevoEstado == 1);
        espacioServicio.obtenerEspaciosPorZona(idZona).forEach(espacioDto -> {
            espacioServicio.cambiarActivo(espacioDto.getId(), estaActiva);
        });

        zonaRepositorio.save(zona);
        return estaActiva;
    }
}
