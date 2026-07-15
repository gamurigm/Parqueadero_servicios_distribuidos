package ec.edu.espe.zonas.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.security.KeyFactory;
import java.security.PublicKey;
import java.security.spec.X509EncodedKeySpec;
import java.time.Duration;
import java.util.Base64;

@Service
public class JwtService {

    private static final Logger log = LoggerFactory.getLogger(JwtService.class);

    private SecretKey jweSecretKey;
    private PublicKey rsaPublicKey;
    private final String expectedIssuer;
    private final String usuariosServiceUrl;
    private final HttpClient httpClient;

    public JwtService(@Value("${JWT_SECRET:super-secret-key-change-in-production}") String secret,
                      @Value("${JWT_ISSUER:gestion-usuarios}") String expectedIssuer,
                      @Value("${USUARIOS_SERVICE_URL:http://usuarios:5000}") String usuariosServiceUrl) {
        this.expectedIssuer = expectedIssuer;
        this.usuariosServiceUrl = usuariosServiceUrl;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(3))
                .build();

        try {
            String hex = new String(Files.readAllBytes(Paths.get("/keys/jwe-secret.key")), StandardCharsets.UTF_8).trim();
            byte[] keyBytes = hexStringToByteArray(hex);
            this.jweSecretKey = new SecretKeySpec(keyBytes, "AES");
        } catch (Exception e) {
            System.err.println("Advertencia: No se pudo cargar /keys/jwe-secret.key. JWE no funcionará. Error: " + e.getMessage());
        }

        try {
            String pem = new String(Files.readAllBytes(Paths.get("/keys/public.pem")), StandardCharsets.UTF_8).trim();
            String base64 = pem
                    .replace("-----BEGIN PUBLIC KEY-----", "")
                    .replace("-----END PUBLIC KEY-----", "")
                    .replaceAll("\\s+", "");
            byte[] decoded = Base64.getDecoder().decode(base64);
            X509EncodedKeySpec keySpec = new X509EncodedKeySpec(decoded);
            this.rsaPublicKey = KeyFactory.getInstance("RSA").generatePublic(keySpec);
        } catch (Exception e) {
            System.err.println("Advertencia: No se pudo cargar /keys/public.pem. Firma JWT no se verificará. Error: " + e.getMessage());
        }
    }

    public Claims validateToken(String token) {
        if (this.rsaPublicKey != null) {
            // Try plain signed JWT first (inter-service communication)
            try {
                Claims claims = Jwts.parser()
                        .verifyWith(this.rsaPublicKey)
                        .build()
                        .parseSignedClaims(token)
                        .getPayload();

                if (expectedIssuer != null && !expectedIssuer.equals(claims.getIssuer())) {
                    throw new RuntimeException("Issuer inválido en el token.");
                }
                return claims;
            } catch (JwtException ignored) {
                // Not a plain JWT, try JWE below
            }
        }

        try {
            if (this.jweSecretKey == null) {
                throw new RuntimeException("La llave secreta JWE no está inicializada.");
            }

            Claims claims;
            if (this.rsaPublicKey != null) {
                // Nested JWT: decrypt JWE to get inner signed JWT, then verify signature
                Object jweBody = Jwts.parser()
                        .decryptWith(this.jweSecretKey)
                        .build()
                        .parse(token)
                        .getPayload();
                String innerJwt;
                if (jweBody instanceof byte[]) {
                    innerJwt = new String((byte[]) jweBody, java.nio.charset.StandardCharsets.UTF_8);
                } else if (jweBody instanceof String) {
                    innerJwt = (String) jweBody;
                } else {
                    innerJwt = jweBody.toString();
                }
                claims = Jwts.parser()
                        .verifyWith(this.rsaPublicKey)
                        .build()
                        .parseSignedClaims(innerJwt)
                        .getPayload();
            } else {
                claims = Jwts.parser()
                        .decryptWith(this.jweSecretKey)
                        .build()
                        .parseEncryptedClaims(token)
                        .getPayload();
            }

            if (expectedIssuer != null && !expectedIssuer.equals(claims.getIssuer())) {
                throw new RuntimeException("Issuer inválido en el token.");
            }

            return claims;
        } catch (JwtException | IllegalArgumentException e) {
            throw new RuntimeException("Token JWE inválido o expirado: " + e.getMessage(), e);
        }
    }

    public boolean validateActiveToken(String jti) {
        try {
            String body = "{\"jti\":\"" + jti + "\"}";
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(usuariosServiceUrl + "/auth/validate-token"))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(body))
                    .timeout(Duration.ofSeconds(3))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() == 200) {
                return response.body().contains("\"valid\":true");
            }
            return false;
        } catch (Exception e) {
            log.warn("No se pudo validar active_token (fail-open): {}", e.getMessage());
            return true; // fail-open for availability
        }
    }

    private static byte[] hexStringToByteArray(String hex) {
        int len = hex.length();
        byte[] data = new byte[len / 2];
        for (int i = 0; i < len; i += 2) {
            data[i / 2] = (byte) ((Character.digit(hex.charAt(i), 16) << 4)
                    + Character.digit(hex.charAt(i + 1), 16));
        }
        return data;
    }
}
