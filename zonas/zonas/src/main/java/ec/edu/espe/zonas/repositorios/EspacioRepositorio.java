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

}
