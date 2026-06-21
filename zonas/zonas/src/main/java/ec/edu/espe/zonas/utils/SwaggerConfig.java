package ec.edu.espe.zonas.utils;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .servers(List.of(
                        new Server()
                                .url("http://localhost:8080")
                                .description("Local - Directo"),
                        new Server()
                                .url("http://host.docker.internal:8080")
                                .description("Docker - Host"),
                        new Server()
                                .url("http://localhost:8000/zonas")
                                .description("Kong Gateway")
                ))
                .info(new Info()
                        .title("API de Gestión de Zonas y Espacios")
                        .version("1.0")
                        .description("Documentación de la API para gestionar zonas y espacios de estacionamiento")
                        .contact(new Contact()
                                .name("Pablo Campoverde, Gabriel López, Gabriel Murrillo")
                                .url("https://github.com/gamurigm/Parqueadero_servicios_distribuidos"))
                        .license(new License()
                                .name("Apache 2.0")
                                .url("http://springdoc.org")));
    }
}