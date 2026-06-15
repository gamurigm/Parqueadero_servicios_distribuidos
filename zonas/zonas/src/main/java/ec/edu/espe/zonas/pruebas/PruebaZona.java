package ec.edu.espe.zonas.pruebas;

import java.lang.reflect.InvocationHandler;
import java.lang.reflect.Method;
import java.lang.reflect.Proxy;

import ec.edu.espe.zonas.DTOs.ZonaRequestDTO;
import ec.edu.espe.zonas.Servicios.Impl.ZonaServicioImpl;
import ec.edu.espe.zonas.entidades.TipoZona;
import ec.edu.espe.zonas.repositorios.ZonaRepositorio;

public class PruebaZona {

    public static void main(String[] args) {

        // 1. Crear un "Mock" o simulador del repositorio usando Proxy
        // Esto evita tener que levantar todo Spring Boot y la base de datos
        ZonaRepositorio mockRepositorio = (ZonaRepositorio) Proxy.newProxyInstance(
                PruebaZona.class.getClassLoader(),
                new Class<?>[] { ZonaRepositorio.class },
                new InvocationHandler() {
                    @Override
                    public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
                        if (method.getName().equals("countByTipoZona")) {
                            return 0L; // Simulamos que hay 0 zonas de ese tipo
                        }
                        return null;
                    }
                });

        // 2. Instanciar el servicio inyectando el mock manualmente
        ZonaServicioImpl zonaServicio = new ZonaServicioImpl(mockRepositorio, null);

        System.out.println("===============================================================");
        System.out.println(" INICIANDO PRUEBAS DE GENERACIÓN DE CÓDIGO (SIN SPRING BOOT) ");
        System.out.println("===============================================================");

        // Datos de prueba: una zona por cada TipoZona
        String[][] zonas = {
                { "Zona VIP Norte", "Zona exclusiva para clientes VIP", "VIP" },
                { "Zona Regular Sur", "Zona estándar para clientes regulares", "REGULAR" },
                { "Zona Externa Este", "Zona ubicada en el exterior del edificio", "EXTERNA" },
                { "Zona Interna Oeste", "Zona ubicada en el interior del edificio", "INTERNA" },
                { "Zona Preferencial Central", "Zona de atención preferencial", "PREFERENCIAL" },
        };

        try {
            for (String[] datos : zonas) {
                String nombre = datos[0];
                String descripcion = datos[1];
                TipoZona tipo = TipoZona.valueOf(datos[2]);

                ZonaRequestDTO req = new ZonaRequestDTO();
                req.setNombre(nombre);
                req.setDescripcion(descripcion);
                req.setTipoZona(tipo);

                // Llamamos directamente al método de generación de código
                String codigo = zonaServicio.generarCodigoZona(req);

                System.out.printf(" [%-14s] %-30s → código generado: %s%n",
                        tipo, nombre, codigo);
            }

        } catch (Exception e) {
            System.out.println("Error inesperado: " + e.getMessage());
            e.printStackTrace();
        }

        System.out.println("===============================================================");
    }
}
