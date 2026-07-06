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

    @Value("${jwt.public-key-path:keys/public.pem}")
    private String publicKeyPath;

    @Value("${JWT_ISSUER:gestion-usuarios}")
    private String expectedIssuer;

    private PublicKey publicKey;

    @PostConstruct
    public void init() {
        String[] possiblePaths = {
                "../../keys/public.pem",
                publicKeyPath,
                System.getProperty("user.dir") + "/../../keys/public.pem",
                // 5. Para Docker (si montas la carpeta keys)
                "/app/keys/public.pem",
                // 6. Relativas al classpath
                "keys/public.pem",
                "../keys/public.pem",
        };

        String keyContent = null;
        String foundPath = null;

        for (String path : possiblePaths) {
            try {
                Path filePath = Paths.get(path);
                if (Files.exists(filePath)) {
                    keyContent = new String(Files.readAllBytes(filePath), StandardCharsets.UTF_8);
                    foundPath = path;
                    break;
                }
            } catch (Exception e) {
                // Continuar con la siguiente ruta
            }
        }

        if (keyContent == null) {
            System.err.println("❌ No se encontró el archivo de clave pública JWT.");
            System.err.println("Buscado en:");
            for (String path : possiblePaths) {
                System.err.println("  - " + path);
            }
            System.err.println("⚠️ El servicio JWT no podrá validar tokens.");
            return;
        }

        System.out.println("✅ Clave pública JWT cargada desde: " + foundPath);

        try {
            String cleanKey = keyContent
                    .replace("-----BEGIN PUBLIC KEY-----", "")
                    .replace("-----END PUBLIC KEY-----", "")
                    .replaceAll("\\s", "");

            byte[] keyBytes = Base64.getDecoder().decode(cleanKey);
            X509EncodedKeySpec spec = new X509EncodedKeySpec(keyBytes);
            KeyFactory kf = KeyFactory.getInstance("RSA");
            this.publicKey = kf.generatePublic(spec);
        } catch (Exception e) {
            System.err.println("❌ Error al procesar la clave pública JWT: " + e.getMessage());
            e.printStackTrace();
        }
    }

    public Claims validateToken(String token) {
        try {
            if (this.publicKey == null) {
                throw new RuntimeException("La llave pública RSA no está inicializada.");
            }
            return Jwts.parser()
                    .verifyWith(this.publicKey)
                    .requireIssuer(expectedIssuer)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
        } catch (Exception e) {
            throw new RuntimeException("Token JWT inválido o expirado: " + e.getMessage(), e);
        }
    }
}