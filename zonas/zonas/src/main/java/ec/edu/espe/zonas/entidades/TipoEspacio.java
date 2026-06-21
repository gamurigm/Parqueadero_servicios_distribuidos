package ec.edu.espe.zonas.entidades;

import io.swagger.v3.oas.annotations.media.Schema;
import com.fasterxml.jackson.annotation.JsonValue;

@Schema(description = "Tipos de espacio de estacionamiento")
public enum TipoEspacio {
    AUTO("AUTO"),
    MOTO("MOTO"),
    BUSETA("BUSETA"),
    DISCAPACITADOS("DISCAPACITADOS");

    private final String valor;

    TipoEspacio(String valor) {
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