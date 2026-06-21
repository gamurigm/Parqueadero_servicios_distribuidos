package ec.edu.espe.zonas.entidades;

import io.swagger.v3.oas.annotations.media.Schema;
import com.fasterxml.jackson.annotation.JsonValue;

@Schema(description = "Estado actual de un espacio")
public enum EstadoEspacio {
    DISPONIBLE("DISPONIBLE"),
    OCUPADO("OCUPADO"),
    MANTENIMIENTO("MANTENIMIENTO"),
    RESERVADO("RESERVADO");

    private final String valor;

    EstadoEspacio(String valor) {
        this.valor = valor;
    }

    @JsonValue
    public String getValor() {
        return valor;
    }

    @Override
    public String toString() {
        return valor;
    }
}