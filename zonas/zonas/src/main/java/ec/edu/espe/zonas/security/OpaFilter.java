package ec.edu.espe.zonas.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@Component
@Slf4j
@RequiredArgsConstructor
public class OpaFilter extends OncePerRequestFilter {

    private final OpaService opaService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
            
        String path = request.getRequestURI();
        
        if (path.startsWith("/swagger-ui") || path.startsWith("/v3/api-docs")) {
            filterChain.doFilter(request, response);
            return;
        }

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            filterChain.doFilter(request, response);
            return;
        }

        String userId = "";
        if (authentication instanceof org.springframework.security.authentication.UsernamePasswordAuthenticationToken auth) {
            userId = (String) auth.getDetails();
        }

        String username = authentication.getName();
        List<String> roles = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .map(role -> role.replace("ROLE_", ""))
                .collect(Collectors.toList());

        if (roles.isEmpty() && userId != null && !userId.isEmpty()) {
            try {
                String rolesUrl = "http://gestion-usuarios:3000/roles-Usuario/usuarios/" + userId;
                org.springframework.web.client.RestTemplate rt = new org.springframework.web.client.RestTemplate();
                List<?> userRoleObjs = rt.getForObject(rolesUrl, List.class);
                if (userRoleObjs != null) {
                    roles = userRoleObjs.stream()
                        .map(obj -> {
                            if (obj instanceof java.util.Map map) {
                                Object r = map.get("rol");
                                if (r instanceof java.util.Map rMap) {
                                    return (String) rMap.get("nombreRol");
                                }
                            }
                            return null;
                        })
                        .filter(java.util.Objects::nonNull)
                        .map(r -> r.replace("ROLE_", ""))
                        .collect(Collectors.toList());
                }
            } catch (Exception e) {
                log.warn("Could not fetch dynamic roles for user {}: {}", userId, e.getMessage());
            }
        }

        boolean isAllowed = opaService.checkPermission(
                userId,
                username,
                roles,
                request.getMethod(),
                request.getRequestURI()
        );

        if (!isAllowed) {
            log.warn("OPA denied {} {} for user={}", request.getMethod(), path, username);
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            response.setContentType("application/json");
            response.getWriter().write("{\"error\": \"Access denied by OPA\"}");
            return;
        }

        filterChain.doFilter(request, response);
    }
}
