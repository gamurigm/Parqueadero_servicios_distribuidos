package ec.edu.espe.zonas.entidades;

import java.time.LocalDateTime;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "espacios")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder

public class Espacio {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(unique = true, nullable = false, length = 50)
    private String codigo; // nombre

    @Column(nullable = true)
    private String descripcion;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoEspacio tipoEspacio;

    @Column(nullable = true)
    private boolean activo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EstadoEspacio estado;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_zona")
    private Zona zona;

    @Column
    private LocalDateTime fechaCreacion;

    @Column
    private LocalDateTime fechaModificacion;

}
