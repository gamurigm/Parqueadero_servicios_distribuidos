package ec.edu.espe.zonas.utils;

import ec.edu.espe.zonas.DTOs.EspacioRequestDTO;
import ec.edu.espe.zonas.DTOs.EspacioResponseDTO;
import ec.edu.espe.zonas.entidades.Espacio;
import org.springframework.stereotype.Component;

@Component
public class UtilsMappers {

    public EspacioResponseDTO toResponseDTO(Espacio e) {

        if (e == null)
            return null;

        return EspacioResponseDTO.builder()
                .id(e.getId())
                .codigo(e.getCodigo())
                .descripcion(e.getDescripcion())
                .tipoEspacio(e.getTipoEspacio())
                .estado(e.getEstado())
                .idZona(e.getZona().getId())
                .nombreZona(e.getZona().getNombre())
                .fechaCreacion(e.getFechaCreacion())
                .fechaModificacion(e.getFechaModificacion())
                .build();
    }

    public Espacio toEntity(EspacioRequestDTO requestDTO) {
        // operaciones de creacion actualizacion y creacion
        // // de estado
        if (requestDTO == null)
            return null;
        return Espacio.builder()

                .codigo(requestDTO.getCodigo())
                .descripcion(requestDTO.getDescripcion())
                .tipoEspacio(requestDTO.getTipoEspacio())

                .build();
    }
}
