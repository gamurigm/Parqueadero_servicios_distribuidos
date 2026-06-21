package ec.edu.espe.zonas.controladores;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.Parameter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

import ec.edu.espe.zonas.Servicios.EspacioServicio;
import ec.edu.espe.zonas.DTOs.EspacioResponseDTO;
import ec.edu.espe.zonas.DTOs.EspacioRequestDTO;
import ec.edu.espe.zonas.entidades.EstadoEspacio;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/espacios")
@RequiredArgsConstructor
@Tag(name = "Espacios", description = "API para la gestión de espacios de estacionamiento")
public class EspacioControlador {

    private final EspacioServicio espacioServicio;

    @GetMapping("/")
    @Operation(summary = "Obtener todos los espacios",
            description = "Retorna una lista de todos los espacios registrados en el sistema")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lista de espacios obtenida exitosamente")
    })
    public ResponseEntity<List<EspacioResponseDTO>> obtenerEspacios() {
        return ResponseEntity.ok(espacioServicio.obtenerTodosLosEspacios());
    }

    @GetMapping("/zona/{idZona}")
    @Operation(summary = "Obtener espacios por zona",
            description = "Retorna todos los espacios pertenecientes a una zona específica")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Espacios encontrados"),
            @ApiResponse(responseCode = "404", description = "Zona no encontrada", content = @Content)
    })
    public ResponseEntity<List<EspacioResponseDTO>> obtenerEspaciosPorZona(
            @Parameter(description = "ID de la zona",
                    example = "123e4567-e89b-12d3-a456-426614174000",
                    required = true)
            @PathVariable UUID idZona) {
        return ResponseEntity.ok(espacioServicio.obtenerEspaciosPorZona(idZona));
    }

    @PostMapping("/")
    @Operation(summary = "Crear un nuevo espacio",
            description = "Registra un nuevo espacio de estacionamiento en el sistema")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Espacio creado exitosamente"),
            @ApiResponse(responseCode = "400", description = "Datos inválidos", content = @Content),
            @ApiResponse(responseCode = "404", description = "Zona no encontrada", content = @Content),
            @ApiResponse(responseCode = "409", description = "Conflicto - Código ya existe", content = @Content)
    })
    public ResponseEntity<EspacioResponseDTO> crearEspacio(
            @Valid @RequestBody
            @Schema(description = "Datos del espacio a crear", required = true)
            EspacioRequestDTO request) {
        EspacioResponseDTO response = espacioServicio.crearEspacio(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar un espacio",
            description = "Actualiza los datos de un espacio existente por su ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Espacio actualizado exitosamente"),
            @ApiResponse(responseCode = "400", description = "Datos inválidos", content = @Content),
            @ApiResponse(responseCode = "404", description = "Espacio no encontrado", content = @Content),
            @ApiResponse(responseCode = "409", description = "Conflicto - Código ya existe", content = @Content)
    })
    public ResponseEntity<EspacioResponseDTO> actualizarEspacio(
            @Parameter(description = "ID del espacio a actualizar",
                    example = "123e4567-e89b-12d3-a456-426614174000",
                    required = true)
            @PathVariable UUID id,
            @Valid @RequestBody
            @Schema(description = "Datos actualizados del espacio", required = true)
            EspacioRequestDTO request) {
        return ResponseEntity.ok(espacioServicio.actualizarEspacio(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar un espacio",
            description = "Elimina un espacio del sistema")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Espacio eliminado exitosamente"),
            @ApiResponse(responseCode = "404", description = "Espacio no encontrado", content = @Content)
    })
    public ResponseEntity<String> eliminarEspacio(
            @Parameter(description = "ID del espacio a eliminar",
                    example = "123e4567-e89b-12d3-a456-426614174000",
                    required = true)
            @PathVariable UUID id) {
        String mensaje = espacioServicio.eliminarEspacio(id);
        return ResponseEntity.ok(mensaje);
    }

    @PatchMapping("/{id}/estado")
    @Operation(summary = "Cambiar estado del espacio",
            description = "Actualiza el estado de un espacio (DISPONIBLE, OCUPADO, MANTENIMIENTO)")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Estado actualizado exitosamente"),
            @ApiResponse(responseCode = "404", description = "Espacio no encontrado", content = @Content)
    })
    public ResponseEntity<EspacioResponseDTO> cambiarEstado(
            @Parameter(description = "ID del espacio",
                    example = "123e4567-e89b-12d3-a456-426614174000",
                    required = true)
            @PathVariable UUID id,
            @Parameter(description = "Nuevo estado del espacio",
                    example = "OCUPADO",
                    required = true,
                    schema = @Schema(allowableValues = {"DISPONIBLE", "OCUPADO", "MANTENIMIENTO"}))
            @RequestParam @jakarta.validation.constraints.NotNull EstadoEspacio estado) {
        return ResponseEntity.ok(espacioServicio.cambiarEstado(id, estado));
    }

    @PatchMapping("/{id}/activar-desactivar")
    @Operation(summary = "Activar/Desactivar espacio",
            description = "Alterna el estado activo/inactivo de un espacio")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Estado cambiado exitosamente"),
            @ApiResponse(responseCode = "404", description = "Espacio no encontrado", content = @Content)
    })
    public ResponseEntity<String> activarDesactivar(
            @Parameter(description = "ID del espacio",
                    example = "123e4567-e89b-12d3-a456-426614174000",
                    required = true)
            @PathVariable UUID id) {
        String mensaje = espacioServicio.toggleActivo(id);
        return ResponseEntity.ok(mensaje);
    }
}