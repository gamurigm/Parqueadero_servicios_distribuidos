package ec.edu.espe.zonas.controladores;

import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

import ec.edu.espe.zonas.Servicios.ZonaServicio;
import jakarta.validation.Valid;
import ec.edu.espe.zonas.DTOs.ZonaResponseDTO;
import ec.edu.espe.zonas.DTOs.ZonaRequestDTO;

@RestController
@RequestMapping("/api/v1/zonas")
@RequiredArgsConstructor

public class ZonaControlador {

    private final ZonaServicio zonaServicio;

    @GetMapping("/")
    public ResponseEntity<org.springframework.data.domain.Page<ZonaResponseDTO>> listarZonas(
            @org.springframework.data.web.PageableDefault(size = 10) org.springframework.data.domain.Pageable pageable) {
        return ResponseEntity.ok(zonaServicio.listarZonas(pageable));
    }

    @PostMapping("/")
    public ResponseEntity<ZonaResponseDTO> crearZona(@Valid @RequestBody ZonaRequestDTO request) {
        ZonaResponseDTO response = zonaServicio.crearZona(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PutMapping("/{idZona}")
    public ResponseEntity<ZonaResponseDTO> actualizarZona(@PathVariable UUID idZona,
            @Valid @RequestBody ZonaRequestDTO request) {
        ZonaResponseDTO response = zonaServicio.actualizarZona(idZona, request);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{idZona}/activar-desactivar")
    public ResponseEntity<Boolean> activarDesactivar(@PathVariable UUID idZona, 
            @org.springframework.web.bind.annotation.RequestParam(defaultValue = "false") boolean forzar) {
        return ResponseEntity.ok(zonaServicio.activarDesactivar(idZona, forzar));
    }

    @DeleteMapping("/{idZona}")
    public ResponseEntity<String> eliminarZona(@PathVariable UUID idZona) {
        String mensaje = zonaServicio.eliminarZona(idZona);
        return ResponseEntity.ok(mensaje);
    }

}
