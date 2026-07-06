package ec.edu.espe.zonas.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.security.KeyFactory;
import java.security.PublicKey;
import java.security.spec.X509EncodedKeySpec;
import java.util.Base64;

@Service
public class JwtService {

    private PublicKey publicKey;
    private final String expectedIssuer;

    public JwtService(@Value("${JWT_SECRET:super-secret-key-change-in-production}") String secret,
                      @Value("${JWT_ISSUER:gestion-usuarios}") String expectedIssuer) {
        this.expectedIssuer = expectedIssuer;
        try {
            // Leer public key del volumen montado
            String keyContent = new String(Files.readAllBytes(Paths.get("/keys/public.pem")), StandardCharsets.UTF_8);
            keyContent = keyContent.replaceAll("-----BEGIN PUBLIC KEY-----", "")
                                   .replaceAll("-----END PUBLIC KEY-----", "")
                                   .replaceAll("\\s+", "");
            byte[] keyBytes = Base64.getDecoder().decode(keyContent);
            X509EncodedKeySpec spec = new X509EncodedKeySpec(keyBytes);
            KeyFactory kf = KeyFactory.getInstance("RSA");
            this.publicKey = kf.generatePublic(spec);
        } catch (Exception e) {
            System.err.println("Advertencia: No se pudo cargar /keys/public.pem. El servicio fallará al validar JWTs si requiere RS256. Error: " + e.getMessage());
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