package ec.edu.espe.zonas;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import ec.edu.espe.zonas.DTOs.EspacioRequestDTO;
import ec.edu.espe.zonas.DTOs.EspacioResponseDTO;
import ec.edu.espe.zonas.DTOs.ZonaRequestDTO;
import ec.edu.espe.zonas.DTOs.ZonaResponseDTO;
import ec.edu.espe.zonas.Servicios.EspacioServicio;
import ec.edu.espe.zonas.Servicios.ZonaServicio;
import ec.edu.espe.zonas.entidades.EstadoEspacio;
import ec.edu.espe.zonas.entidades.TipoEspacio;
import ec.edu.espe.zonas.entidades.TipoZona;

@SpringBootApplication
public class ZonasApplication {

	public static void main(String[] args) {
		SpringApplication.run(ZonasApplication.class, args);
	}

	@Bean
	public CommandLineRunner testActivarDesactivar(ZonaServicio zonaServicio, EspacioServicio espacioServicio) {
		return args -> {
			System.out.println("\n==================================================");
			System.out.println("   PRUEBA COMPLETA: activarDesactivar de Zonas");
			System.out.println("==================================================\n");

			// ---------------------------------------------------------------
			// PASO 1: Crear una zona VIP con capacidad de 10
			// ---------------------------------------------------------------
			System.out.println("PASO 1: Crear zona VIP con capacidad 10");
			System.out.println("--------------------------------------------------");

			ZonaRequestDTO zonaReq = ZonaRequestDTO.builder()
					.nombre("Zona Prueba " + System.currentTimeMillis())
					.descripcion("Zona de prueba para validar activar/desactivar")
					.tipoZona(TipoZona.VIP)
					.capacidad(10)
					.build();

			ZonaResponseDTO zonaCreada = zonaServicio.crearZona(zonaReq, null, null);
			System.out.println("  ✅ Zona creada: " + zonaCreada.getNombre());
			System.out.println("     Código: " + zonaCreada.getCodigo());
			System.out.println("     ID: " + zonaCreada.getIdZona());
			System.out.println("     Estado: " + zonaCreada.getEstado() + " (1=activa)");
			System.out.println();

			// ---------------------------------------------------------------
			// PASO 2: Crear 10 espacios para la zona (empiezan activos, DISPONIBLE)
			// ---------------------------------------------------------------
			System.out.println("PASO 2: Crear 10 espacios para la zona");
			System.out.println("--------------------------------------------------");

			EspacioResponseDTO primerEspacio = null;
			for (int i = 1; i <= 11; i++) {
				EspacioRequestDTO espacioReq = new EspacioRequestDTO();
				espacioReq.setIdZona(zonaCreada.getIdZona());
				espacioReq.setCodigo("ESP-" + String.format("%03d", i));
				espacioReq.setDescripcion("Espacio " + i + " de prueba");
				espacioReq.setTipoEspacio(TipoEspacio.AUTO);

				try {
					EspacioResponseDTO espacioCreado = espacioServicio.crearEspacio(espacioReq, null, null);
					System.out.println("  ✅ Espacio " + i + " creado: " + espacioCreado.getCodigo()
							+ " | activo=" + espacioCreado.isActivo()
							+ " | estado=" + espacioCreado.getEstado());

					if (i == 1) {
						primerEspacio = espacioCreado;
					}
				} catch (Exception e) {
					System.out.println("  ❌ Error al crear espacio " + i + ": " + e.getMessage());
				}
			}
			System.out.println();

			// ---------------------------------------------------------------
			// PASO 3: Intentar DESACTIVAR la zona (todos disponibles → debe funcionar)
			// ---------------------------------------------------------------
			System.out.println("PASO 3: Intentar DESACTIVAR la zona (todos los espacios están DISPONIBLES)");
			System.out.println("--------------------------------------------------");
			try {
				zonaServicio.activarDesactivar(zonaCreada.getIdZona(), false, null, null);
				System.out.println("  ✅ Zona desactivada exitosamente");
				System.out.println("     La zona ahora está INACTIVA (estado=0)");
			} catch (Exception e) {
				System.out.println("  ❌ Error inesperado: " + e.getMessage());
			}
			System.out.println();

			// ---------------------------------------------------------------
			// PASO 4: ACTIVAR la zona nuevamente
			// ---------------------------------------------------------------
			System.out.println("PASO 4: ACTIVAR la zona nuevamente");
			System.out.println("--------------------------------------------------");
			try {
				zonaServicio.activarDesactivar(zonaCreada.getIdZona(), false, null, null);
				System.out.println("  ✅ Zona activada exitosamente");
				System.out.println("     La zona ahora está ACTIVA (estado=1)");
			} catch (Exception e) {
				System.out.println("  ❌ Error inesperado: " + e.getMessage());
			}
			System.out.println();

			// ---------------------------------------------------------------
			// PASO 5: Cambiar un espacio a OCUPADO
			// ---------------------------------------------------------------
			if (primerEspacio != null) {
				System.out.println("PASO 5: Cambiar espacio '" + primerEspacio.getCodigo() + "' a OCUPADO");
				System.out.println("--------------------------------------------------");
				try {
					EspacioResponseDTO espacioActualizado = espacioServicio.cambiarEstado(
							primerEspacio.getId(), EstadoEspacio.OCUPADO, null, null);
					System.out.println("  ✅ Espacio cambiado a OCUPADO");
					System.out.println("     ID: " + espacioActualizado.getId());
					System.out.println("     Estado: " + espacioActualizado.getEstado());
				} catch (Exception e) {
					System.out.println("  ❌ Error inesperado: " + e.getMessage());
				}
			} else {
				System.out.println("PASO 5: Saltado (no se pudo crear el primer espacio)");
			}
			System.out.println();

			// ---------------------------------------------------------------
			// PASO 6: Intentar DESACTIVAR la zona (debe FALLAR - hay espacio ocupado)
			// ---------------------------------------------------------------
			System.out.println("PASO 6: Intentar DESACTIVAR la zona (hay un espacio OCUPADO → debe FALLAR)");
			System.out.println("--------------------------------------------------");
			try {
				zonaServicio.activarDesactivar(zonaCreada.getIdZona(), false, null, null);
				System.out.println("  ❌ ERROR: La zona se desactivó cuando NO debería haberse podido!");
			} catch (Exception e) {
				System.out.println("  ✅ Error esperado capturado correctamente:");
				System.out.println("     " + e.getMessage());
			}

			System.out.println("\n==================================================");
			System.out.println("   FIN DE LA PRUEBA");
			System.out.println("==================================================\n");
		};
	}

}
