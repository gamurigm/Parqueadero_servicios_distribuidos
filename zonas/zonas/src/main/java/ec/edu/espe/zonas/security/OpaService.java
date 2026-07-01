package ec.edu.espe.zonas.security;

import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class OpaService {

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${opa.url:http://opa:8181/v1/data}")
    private String opaUrl;

    public boolean checkPermission(String userId, String username, List<String> roles, String method, String path) {
        try {
            String url = opaUrl + "/authz/zonas";

            // Map method and path to resource and action
            String action = getAction(method);
            String resource = getResource(path, action);

            OpaInput input = new OpaInput();
            input.setUser(new OpaUser(userId, username, roles));
            input.setAction(action);
            input.setResource(resource);
            
            OpaContext context = new OpaContext(method, path);
            input.setContext(context);

            OpaRequest request = new OpaRequest(input);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<OpaRequest> entity = new HttpEntity<>(request, headers);

            OpaResponse response = restTemplate.postForObject(url, entity, OpaResponse.class);

            if (response != null && response.getResult() != null && response.getResult().isAllow()) {
                log.debug("OPA allowed access to {} {}", method, path);
                return true;
            } else {
                log.warn("OPA denied access to {} {}", method, path);
                return false;
            }
        } catch (Exception e) {
            log.error("Error connecting to OPA: {}", e.getMessage());
            return false;
        }
    }

    private String getAction(String method) {
        return switch (method.toUpperCase()) {
            case "GET" -> "read";
            case "POST" -> "create";
            case "PUT", "PATCH" -> "update";
            case "DELETE" -> "delete";
            default -> "read";
        };
    }

    private String getResource(String path, String action) {
        if (path.startsWith("/api/v1/espacios")) {
            return "spaces." + action;
        }
        return "zones." + action;
    }

    @Data
    public static class OpaRequest {
        private OpaInput input;
        public OpaRequest(OpaInput input) { this.input = input; }
    }

    @Data
    public static class OpaInput {
        private OpaUser user;
        private String resource;
        private String action;
        private OpaContext context;
    }

    @Data
    public static class OpaUser {
        private String id;
        private String username;
        private List<String> roles;
        public OpaUser(String id, String username, List<String> roles) {
            this.id = id;
            this.username = username;
            this.roles = roles;
        }
    }

    @Data
    public static class OpaContext {
        private String method;
        private String path;
        public OpaContext(String method, String path) {
            this.method = method;
            this.path = path;
        }
    }

    @Data
    public static class OpaResponse {
        private OpaResult result;
    }

    @Data
    public static class OpaResult {
        private boolean allow;
    }
}
