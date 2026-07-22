package ec.edu.espe.zonas.utils;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins(
                        "http://localhost:8085",
                        "http://127.0.0.1:8085",
                        "http://localhost:8000",
                        "http://127.0.0.1:8000",
                        "http://host.docker.internal:8000",
                        "http://localhost:5000",
                        "http://127.0.0.1:5000",
                        "http://host.docker.internal:5000",
                        "http://localhost:3000",
                        "http://127.0.0.1:3000",
                        "http://host.docker.internal:3000",
                        "http://localhost:3001",
                        "http://127.0.0.1:3001",
                        "http://host.docker.internal:3001",
                        "http://localhost:3002",
                        "http://127.0.0.1:3002",
                        "http://host.docker.internal:3002",
                        "http://localhost:3003",
                        "http://127.0.0.1:3003",
                        "http://host.docker.internal:3003",
                        "http://localhost:8080",
                        "http://127.0.0.1:8080",
                        "http://host.docker.internal:8080",
                        "http://localhost:8081",
                        "http://127.0.0.1:8081",
                        "http://host.docker.internal:8081")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }
}