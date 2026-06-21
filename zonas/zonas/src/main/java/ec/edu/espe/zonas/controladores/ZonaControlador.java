package ec.edu.espe.zonas.controladores;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.Parameter;
import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

import ec.edu.espe.zonas.Servicios.ZonaServicio;
import jakarta.validation.Valid;
import ec.edu.espe.zonas.DTOs.ZonaResponseDTO;
import ec.edu.espe.zonas.DTOs.ZonaRequestDTO;

@RestController
@RequestMapping("/api/v1/zonas")
@RequiredArgsConstructor
@Tag(name = "Zonas", description = "API para la gestión de zonas de estacionamiento")
public class ZonaControlador {

    private final ZonaServicio zonaServicio;

    @GetMapping("/")
    @Operation(summary = "Listar zonas paginadas",
            description = "Retorna una lista paginada de todas las zonas registradas en el sistema")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lista de zonas obtenida exitosamente"),
            @ApiResponse(responseCode = "400", description = "Parámetros de paginación inválidos", content = @Content)
    })
    public ResponseEntity<Page<ZonaResponseDTO>> listarZonas(
            @Parameter(description = "Parámetros de paginación (page, size, sort)")
            @PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(zonaServicio.listarZonas(pageable));
    }

    @PostMapping("/")
    @Operation(summary = "Crear una nueva zona",
            description = "Registra una nueva zona de estacionamiento en el sistema")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Zona creada exitosamente"),
            @ApiResponse(responseCode = "400", description = "Datos inválidos o zona ya existe",
                    content = @Content),
            @ApiResponse(responseCode = "409", description = "Conflicto - Nombre o código ya existe",
                    content = @Content)
    })
    public ResponseEntity<ZonaResponseDTO> crearZona(
            @Valid @RequestBody
            @Schema(description = "Datos de la zona a crear", required = true)
            ZonaRequestDTO request) {
        ZonaResponseDTO response = zonaServicio.crearZona(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PutMapping("/{idZona}")
    @Operation(summary = "Actualizar una zona",
            description = "Actualiza los datos de una zona existente por su ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Zona actualizada exitosamente"),
            @ApiResponse(responseCode = "400", description = "Datos inválidos", content = @Content),
            @ApiResponse(responseCode = "404", description = "Zona no encontrada", content = @Content),
            @ApiResponse(responseCode = "409", description = "Conflicto - Nombre ya existe", content = @Content)
    })
    public ResponseEntity<ZonaResponseDTO> actualizarZona(
            @Parameter(description = "ID de la zona a actualizar",
                    example = "123e4567-e89b-12d3-a456-426614174000",
                    required = true)
            @PathVariable UUID idZona,
            @Valid @RequestBody
            @Schema(description = "Datos actualizados de la zona", required = true)
            ZonaRequestDTO request) {
        ZonaResponseDTO response = zonaServicio.actualizarZona(idZona, request);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{idZona}/activar-desactivar")
    @Operation(summary = "Activar/Desactivar una zona",
            description = "Alterna el estado activo/inactivo de una zona. Si tiene espacios, se puede forzar la desactivación")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Estado cambiado exitosamente"),
            @ApiResponse(responseCode = "404", description = "Zona no encontrada", content = @Content),
            @ApiResponse(responseCode = "409", description = "No se puede desactivar - Zona tiene espacios",
                    content = @Content)
    })
    public ResponseEntity<String> activarDesactivar(
            @Parameter(description = "ID de la zona",
                    example = "123e4567-e89b-12d3-a456-426614174000",
                    required = true)
            @PathVariable UUID idZona,
            @Parameter(description = "Forzar desactivación incluso si tiene espacios",
                    example = "false")
            @RequestParam(defaultValue = "false") boolean forzar) {
        String mensaje = zonaServicio.activarDesactivar(idZona, forzar);
        return ResponseEntity.ok(mensaje);
    }

    @DeleteMapping("/{idZona}")
    @Operation(summary = "Eliminar una zona",
            description = "Elimina una zona del sistema. Solo permite eliminar si no tiene espacios asociados")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Zona eliminada exitosamente"),
            @ApiResponse(responseCode = "404", description = "Zona no encontrada", content = @Content),
            @ApiResponse(responseCode = "409", description = "No se puede eliminar - Zona tiene espacios",
                    content = @Content)
    })
    public ResponseEntity<String> eliminarZona(
            @Parameter(description = "ID de la zona a eliminar",
                    example = "123e4567-e89b-12d3-a456-426614174000",
                    required = true)
            @PathVariable UUID idZona) {
        String mensaje = zonaServicio.eliminarZona(idZona);
        return ResponseEntity.ok(mensaje);
    }
}