package ec.edu.espe.zonas.entidades;

import io.swagger.v3.oas.annotations.media.Schema;
import com.fasterxml.jackson.annotation.JsonValue;

@Schema(description = "Tipos de zona de estacionamiento")
public enum TipoZona {
    VIP("VIP"),
    REGULAR("REGULAR"),
    EXTERNO("EXTERNO"),
    INTERNO("INTERNO"),
    PREFERENCIAL("PREFERENCIAL");

    private final String valor;

    TipoZona(String valor) {
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