package ec.edu.espe.zonas.repositorios;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import ec.edu.espe.zonas.entidades.Espacio;

import ec.edu.espe.zonas.entidades.EstadoEspacio;

public interface EspacioRepositorio extends JpaRepository<Espacio, UUID> {

    boolean existsByCodigo(String codigo);

    List<Espacio> findByZonaId(UUID idZona);

    long countByZonaId(UUID idZona);

    List<Espacio> findByZonaIdAndEstado(UUID idZona, EstadoEspacio estado);

    List<Espacio> findByEstado(EstadoEspacio estado);

    @org.springframework.data.jpa.repository.Modifying(clearAutomatically = true, flushAutomatically = true)
    @org.springframework.data.jpa.repository.Query("UPDATE Espacio e SET e.activo = :estado, e.fechaModificacion = CURRENT_TIMESTAMP WHERE e.zona.id = :idZona")
    int actualizarActivoPorZona(@org.springframework.data.repository.query.Param("idZona") UUID idZona, @org.springframework.data.repository.query.Param("estado") boolean estado);

}
