package ec.edu.espe.zonas.controladores;

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
public class EspacioControlador {

    private final EspacioServicio espacioServicio;

    @GetMapping("/")
    public ResponseEntity<List<EspacioResponseDTO>> obtenerEspacios() {
        return ResponseEntity.ok(espacioServicio.obtenerTodosLosEspacios());
    }

    @GetMapping("/zona/{idZona}")
    public ResponseEntity<List<EspacioResponseDTO>> obtenerEspaciosPorZona(@PathVariable UUID idZona) {
        return ResponseEntity.ok(espacioServicio.obtenerEspaciosPorZona(idZona));
    }

    @PostMapping("/")
    public ResponseEntity<EspacioResponseDTO> crearEspacio(@Valid @RequestBody EspacioRequestDTO request) {
        EspacioResponseDTO response = espacioServicio.crearEspacio(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<EspacioResponseDTO> actualizarEspacio(@PathVariable UUID id, @Valid @RequestBody EspacioRequestDTO request) {
        return ResponseEntity.ok(espacioServicio.actualizarEspacio(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> eliminarEspacio(@PathVariable UUID id) {
        String mensaje = espacioServicio.eliminarEspacio(id);
        return ResponseEntity.ok(mensaje);
    }

    @PatchMapping("/{id}/estado")
    public ResponseEntity<EspacioResponseDTO> cambiarEstado(@PathVariable UUID id, @RequestParam @jakarta.validation.constraints.NotNull EstadoEspacio estado) {
        return ResponseEntity.ok(espacioServicio.cambiarEstado(id, estado));
    }

    @PatchMapping("/{id}/activar-desactivar")
    public ResponseEntity<String> activarDesactivar(@PathVariable UUID id) {
        String mensaje = espacioServicio.toggleActivo(id);
        return ResponseEntity.ok(mensaje);
    }
}
