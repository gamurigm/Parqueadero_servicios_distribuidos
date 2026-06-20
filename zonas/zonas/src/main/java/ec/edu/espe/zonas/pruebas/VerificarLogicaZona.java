package ec.edu.espe.zonas.pruebas;

import ec.edu.espe.zonas.DTOs.EspacioRequestDTO;
import ec.edu.espe.zonas.DTOs.EspacioResponseDTO;
import ec.edu.espe.zonas.DTOs.ZonaRequestDTO;
import ec.edu.espe.zonas.DTOs.ZonaResponseDTO;
import ec.edu.espe.zonas.Servicios.Impl.EspacioServicioImpl;
import ec.edu.espe.zonas.Servicios.Impl.ZonaServicioImpl;
import ec.edu.espe.zonas.entidades.Espacio;
import ec.edu.espe.zonas.entidades.EstadoEspacio;
import ec.edu.espe.zonas.entidades.TipoEspacio;
import ec.edu.espe.zonas.entidades.TipoZona;
import ec.edu.espe.zonas.entidades.Zona;
import ec.edu.espe.zonas.repositorios.EspacioRepositorio;
import ec.edu.espe.zonas.repositorios.ZonaRepositorio;
import ec.edu.espe.zonas.utils.UtilsMappers;
import org.springframework.web.server.ResponseStatusException;

import java.lang.reflect.Proxy;
import java.util.ArrayList;
import java.util.List;
import java.util.Scanner;
import java.util.UUID;
import java.util.stream.Collectors;

public class VerificarLogicaZona {

    private static List<Zona> dbZonas = new ArrayList<>();
    private static List<Espacio> dbEspacios = new ArrayList<>();

    public static void main(String[] args) {

        // --- 1. MOCK REPOSITORIO ZONA ---
        ZonaRepositorio mockZonaRepo = (ZonaRepositorio) Proxy.newProxyInstance(
                VerificarLogicaZona.class.getClassLoader(),
                new Class<?>[]{ZonaRepositorio.class},
                (proxy, method, methodArgs) -> {
                    String methodName = method.getName();
                    switch (methodName) {
                        case "findAll":
                            return new ArrayList<>(dbZonas);
                        case "findById":
                            UUID id = (UUID) methodArgs[0];
                            return dbZonas.stream().filter(z -> z.getId().equals(id)).findFirst();
                        case "existsByNombre":
                            String nombre = (String) methodArgs[0];
                            return dbZonas.stream().anyMatch(z -> z.getNombre().equalsIgnoreCase(nombre));
                        case "existsByCodigo":
                            String cod = (String) methodArgs[0];
                            return dbZonas.stream().anyMatch(z -> z.getCodigo().equalsIgnoreCase(cod));
                        case "countByTipoZona":
                            TipoZona tz = (TipoZona) methodArgs[0];
                            return dbZonas.stream().filter(z -> z.getTipoZona() == tz).count();
                        case "save":
                            Zona z = (Zona) methodArgs[0];
                            if (z.getId() == null) {
                                z.setId(UUID.randomUUID());
                                dbZonas.add(z);
                            } else {
                                dbZonas.removeIf(old -> old.getId().equals(z.getId()));
                                dbZonas.add(z);
                            }
                            return z;
                        case "delete":
                            Zona zDel = (Zona) methodArgs[0];
                            dbZonas.removeIf(old -> old.getId().equals(zDel.getId()));
                            return null;
                        default:
                            return null;
                    }
                }
        );

        // --- 2. MOCK REPOSITORIO ESPACIO ---
        EspacioRepositorio mockEspacioRepo = (EspacioRepositorio) Proxy.newProxyInstance(
                VerificarLogicaZona.class.getClassLoader(),
                new Class<?>[]{EspacioRepositorio.class},
                (proxy, method, methodArgs) -> {
                    String methodName = method.getName();
                    switch (methodName) {
                        case "findAll":
                            return new ArrayList<>(dbEspacios);
                        case "findById":
                            UUID id = (UUID) methodArgs[0];
                            return dbEspacios.stream().filter(e -> e.getId().equals(id)).findFirst();
                        case "findByZonaId":
                            UUID idZona = (UUID) methodArgs[0];
                            return dbEspacios.stream().filter(e -> e.getZona().getId().equals(idZona)).collect(Collectors.toList());
                        case "countByZonaId":
                            UUID idZ = (UUID) methodArgs[0];
                            return dbEspacios.stream().filter(e -> e.getZona().getId().equals(idZ)).count();
                        case "findByZonaIdAndEstado":
                            UUID idZ2 = (UUID) methodArgs[0];
                            EstadoEspacio estado = (EstadoEspacio) methodArgs[1];
                            return dbEspacios.stream().filter(e -> e.getZona().getId().equals(idZ2) && e.getEstado() == estado).collect(Collectors.toList());
                        case "save":
                            Espacio e = (Espacio) methodArgs[0];
                            if (e.getId() == null) {
                                e.setId(UUID.randomUUID());
                                dbEspacios.add(e);
                            } else {
                                dbEspacios.removeIf(old -> old.getId().equals(e.getId()));
                                dbEspacios.add(e);
                            }
                            return e;
                        case "delete":
                            Espacio eDel = (Espacio) methodArgs[0];
                            dbEspacios.removeIf(old -> old.getId().equals(eDel.getId()));
                            return null;
                        default:
                            return null;
                    }
                }
        );

        // --- 3. SERVICIOS ---
        UtilsMappers mapper = new UtilsMappers();
        EspacioServicioImpl espacioServicio = new EspacioServicioImpl(mockEspacioRepo, mockZonaRepo, mapper);
        ZonaServicioImpl zonaServicio = new ZonaServicioImpl(mockZonaRepo, espacioServicio);

        // --- 4. MENÚ INTERACTIVO ---
        Scanner scanner = new Scanner(System.in);
        while (true) {
            System.out.println("\n=================================");
            System.out.println("      MENU GESTIÓN DE ZONAS      ");
            System.out.println("=================================");
            System.out.println("1. Listar Zonas");
            System.out.println("2. Crear Zona");
            System.out.println("3. Eliminar Zona");
            System.out.println("4. Activar/Desactivar Zona");
            System.out.println("5. Listar Espacios");
            System.out.println("6. Crear Espacio");
            System.out.println("7. Cambiar Estado de Espacio (Disponible/Ocupado/Mantenimiento)");
            System.out.println("8. Eliminar Espacio");
            System.out.println("0. Salir");
            System.out.print("Elija una opción: ");
            String opcion = scanner.nextLine();

            try {
                switch (opcion) {
                    case "1":
                        org.springframework.data.domain.Page<ZonaResponseDTO> zonas = zonaServicio.listarZonas(org.springframework.data.domain.Pageable.unpaged());
                        if (zonas.isEmpty()) System.out.println("No hay zonas registradas.");
                        zonas.forEach(z -> System.out.printf("ID: %s | Nombre: %s | Codigo: %s | Capacidad: %d | Estado: %s\n",
                                z.getIdZona(), z.getNombre(), z.getCodigo(), z.getCapacidad(), z.getEstado() == 1 ? "ACTIVA" : "INACTIVA"));
                        break;

                    case "2":
                        System.out.print("Nombre de la Zona: ");
                        String nombre = scanner.nextLine();
                        System.out.print("Descripción: ");
                        String desc = scanner.nextLine();
                        System.out.print("Capacidad (número de espacios permitidos): ");
                        int cap = Integer.parseInt(scanner.nextLine());
                        System.out.print("Tipo (VIP, REGULAR, EXTERNO, INTERNO, PREFERENCIAL): ");
                        String tipo = scanner.nextLine();

                        ZonaRequestDTO zReq = new ZonaRequestDTO();
                        zReq.setNombre(nombre);
                        zReq.setDescripcion(desc);
                        zReq.setCapacidad(cap);
                        zReq.setTipoZona(TipoZona.valueOf(tipo.toUpperCase()));

                        ZonaResponseDTO nuevaZona = zonaServicio.crearZona(zReq);
                        System.out.println("✅ Zona Creada con éxito. Código: " + nuevaZona.getCodigo());
                        break;

                    case "3":
                        System.out.print("ID de la Zona a eliminar: ");
                        UUID idDel = UUID.fromString(scanner.nextLine());
                        String msgDelZona = zonaServicio.eliminarZona(idDel);
                        System.out.println("✅ " + msgDelZona);
                        break;

                    case "4":
                        System.out.print("ID de la Zona a activar/desactivar: ");
                        UUID idAct = UUID.fromString(scanner.nextLine());
                        String estadoNuevo = zonaServicio.activarDesactivar(idAct, false);
                        System.out.println("✅ " + estadoNuevo);
                        break;

                    case "5":
                        org.springframework.data.domain.Page<EspacioResponseDTO> espacios = espacioServicio.obtenerEspacios(org.springframework.data.domain.Pageable.unpaged());
                        if (espacios.isEmpty()) System.out.println("No hay espacios registrados.");
                        espacios.forEach(e -> System.out.printf("ID: %s | Código: %s | Zona: %s | Estado: %s | Activo: %s\n",
                                e.getId(), e.getCodigo(), e.getNombreZona(), e.getEstado(), e.isActivo()));
                        break;

                    case "6":
                        System.out.print("ID de la Zona donde crear el espacio: ");
                        UUID idZonaEsp = UUID.fromString(scanner.nextLine());
                        System.out.print("Descripción del Espacio: ");
                        String descEsp = scanner.nextLine();
                        System.out.print("Tipo de Espacio (AUTO, MOTO, BUSETA, DISCAPACITADOS): ");
                        String tipoEsp = scanner.nextLine();

                        EspacioRequestDTO eReq = new EspacioRequestDTO();
                        eReq.setIdZona(idZonaEsp);
                        eReq.setDescripcion(descEsp);
                        eReq.setTipoEspacio(TipoEspacio.valueOf(tipoEsp.toUpperCase()));
                        
                        EspacioResponseDTO nuevoEsp = espacioServicio.crearEspacio(eReq);
                        System.out.println("✅ Espacio Creado con éxito. Código autogenerado: " + nuevoEsp.getCodigo());
                        break;

                    case "7":
                        System.out.print("ID del Espacio a cambiar de estado: ");
                        UUID idEspEst = UUID.fromString(scanner.nextLine());
                        System.out.print("Nuevo estado (DISPONIBLE, OCUPADO, RESERVADO, MANTENIMIENTO): ");
                        String estadoStr = scanner.nextLine();
                        espacioServicio.cambiarEstado(idEspEst, EstadoEspacio.valueOf(estadoStr.toUpperCase()));
                        System.out.println("✅ Estado del espacio actualizado con éxito.");
                        break;

                    case "8":
                        System.out.print("ID del Espacio a eliminar: ");
                        UUID idEspDel = UUID.fromString(scanner.nextLine());
                        String msgDelEsp = espacioServicio.eliminarEspacio(idEspDel);
                        System.out.println("✅ " + msgDelEsp);
                        break;

                    case "0":
                        System.out.println("Saliendo...");
                        scanner.close();
                        return;

                    default:
                        System.out.println("❌ Opción inválida.");
                }
            } catch (ResponseStatusException ex) {
                System.out.println("❌ ERROR DE VALIDACIÓN: " + ex.getReason());
            } catch (Exception ex) {
                System.out.println("❌ ERROR: " + ex.getMessage());
            }
        }
    }
}
