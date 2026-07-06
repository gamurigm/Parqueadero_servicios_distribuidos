package ec.edu.espe.zonas.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.security.KeyFactory;
import java.security.PublicKey;
import java.security.spec.X509EncodedKeySpec;
import java.util.Base64;

@Service
public class JwtService {

    @Value("${jwt.public-key-path:jwt-keys/jwt-public.pem}")
    private String publicKeyPath;

    private PublicKey publicKey;

    @PostConstruct
    public void init() {
        String[] possiblePaths = {
            "/app/jwt-keys/jwt-public.pem",
            "/app/" + publicKeyPath,
            System.getProperty("user.dir") + "/jwt-keys/jwt-public.pem",
            System.getProperty("user.dir") + "/../jwt-keys/jwt-public.pem",
            "jwt-keys/jwt-public.pem",
            "../jwt-keys/jwt-public.pem",
            "../../jwt-keys/jwt-public.pem",
        };

        String publicKeyContent = null;
        String foundPath = null;

        for (String path : possiblePaths) {
            try {
                Path filePath = Paths.get(path);
                if (Files.exists(filePath)) {
                    publicKeyContent = new String(Files.readAllBytes(filePath), StandardCharsets.UTF_8);
                    foundPath = path;
                    break;
                }
            } catch (Exception e) {
                // Continuar con la siguiente ruta
            }
        }

        if (publicKeyContent == null) {
            throw new RuntimeException(
                "No se encontró el archivo de clave pública JWT. " +
                "Buscado en: " + String.join(", ", possiblePaths)
            );
        }

        System.out.println("✅ Clave pública JWT cargada desde: " + foundPath);

        try {
            String cleanPublicKey = publicKeyContent
                    .replace("-----BEGIN PUBLIC KEY-----", "")
                    .replace("-----END PUBLIC KEY-----", "")
                    .replaceAll("\\s", "");
            
            byte[] keyBytes = Base64.getDecoder().decode(cleanPublicKey);
            X509EncodedKeySpec spec = new X509EncodedKeySpec(keyBytes);
            KeyFactory keyFactory = KeyFactory.getInstance("RSA");
            this.publicKey = keyFactory.generatePublic(spec);
        } catch (Exception e) {
            throw new RuntimeException("Error al procesar la clave pública JWT: " + e.getMessage(), e);
        }
    }

    public Claims validateToken(String token) {
        try {
            // 🔥 Usar publicKey directamente en verifyWith
            return Jwts.parser()
                    .verifyWith(publicKey)  
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
        } catch (Exception e) {
            throw new RuntimeException("Token JWT inválido o expirado: " + e.getMessage(), e);
        }
    }
}