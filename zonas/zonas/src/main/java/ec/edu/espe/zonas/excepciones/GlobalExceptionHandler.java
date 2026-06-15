package ec.edu.espe.zonas.excepciones;


import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * Maneja errores de formato JSON:
     * - Enum inválido (ej: "REG" en vez de "REGULAR")
     * - JSON mal estructurado
     */
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<Map<String, Object>> handleHttpMessageNotReadable(HttpMessageNotReadableException ex) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("estado", 400);

        Throwable causa = ex.getCause();

        // Error de Enum o deserialización genérica
        if (causa != null && causa.getMessage() != null && causa.getMessage().contains("Cannot deserialize value of type")) {
            body.put("error", "Valor inválido o formato incorrecto");
            body.put("mensaje", "El valor proporcionado no es aceptado, verifica los tipos de datos (como valores para el tipo de zona o espacio).");
        } else {
            body.put("error", "Error en el formato del JSON");
            body.put("mensaje", "Verifica que el JSON enviado tenga la estructura y los tipos de datos correctos.");
        }

        return new ResponseEntity<>(body, HttpStatus.BAD_REQUEST);
    }

    /**
     * Maneja errores de validación de Spring (@Valid: @NotBlank, @Min, @Size, etc.)
     * Agrupa todos los campos inválidos en un solo mensaje.
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("estado", 400);
        body.put("error", "Error de validación: uno o más campos no cumplen las reglas");

        Map<String, String> camposConError = new LinkedHashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            camposConError.put(fieldName, errorMessage);
        });

        body.put("camposInvalidos", camposConError);
        return new ResponseEntity<>(body, HttpStatus.BAD_REQUEST);
    }

    /**
     * Maneja errores de negocio lanzados manualmente en los Servicios.
     * Ej: "YA EXISTE EL NOMBRE", "No se puede desactivar la zona..."
     */
    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<Map<String, Object>> handleResponseStatusException(ResponseStatusException ex) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("estado", ex.getStatusCode().value());
        body.put("error", ex.getReason() != null ? ex.getReason() : "Error en la operación solicitada");
        return new ResponseEntity<>(body, ex.getStatusCode());
    }

    /**
     * Captura cualquier otro error inesperado.
     * Oculta el stack trace y muestra solo el mensaje descriptivo.
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGeneralException(Exception ex) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("estado", 500);
        body.put("error", "Error interno del servidor");
        body.put("detalle", ex.getMessage());
        return new ResponseEntity<>(body, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
