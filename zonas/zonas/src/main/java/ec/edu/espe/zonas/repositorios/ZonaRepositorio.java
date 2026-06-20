package ec.edu.espe.zonas.repositorios;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import ec.edu.espe.zonas.entidades.Zona;

public interface ZonaRepositorio extends JpaRepository<Zona, UUID> {
    boolean existsByCodigo(String codigo);

    boolean existsByNombre(String nombre);
    
    boolean existsByNombreAndIdNot(String nombre, UUID id);

    long countByTipoZona(ec.edu.espe.zonas.entidades.TipoZona tipoZona);

    /**
     * Busca la zona cuyo código empiece con el prefijo dado y tenga el número más alto.
     * Ej: prefijo "VIP-ZN-" → devuelve la zona con código "VIP-ZN-005" (la más alta).
     */
    java.util.Optional<Zona> findTopByCodigoStartingWithOrderByCodigoDesc(String prefijo);

}
