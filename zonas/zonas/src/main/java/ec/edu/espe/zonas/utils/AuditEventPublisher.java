package ec.edu.espe.zonas.utils;

import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class AuditEventPublisher {

    private static final Logger log = LoggerFactory.getLogger(AuditEventPublisher.class);

    private final RabbitTemplate rabbitTemplate;

    @Value("${app.rabbitmq.exchange:audit_exchange}")
    private String exchange;

    @Value("${app.rabbitmq.routing-key:audit.event}")
    private String routingKey;

    public AuditEventPublisher(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }

    public void publish(String servicio, String accion, String entidad, String usuario, String ip, String mac, Map<String, Object> datos) {
        try {
            Map<String, Object> event = Map.of(
                "servicio", servicio,
                "accion", accion,
                "entidad", entidad,
                "usuario", usuario != null ? usuario : "",
                "ip", ip != null ? ip : "",
                "mac", mac != null ? mac : "",
                "datos", datos != null ? datos : Map.of()
            );
            rabbitTemplate.convertAndSend(exchange, routingKey, event);
            log.debug("Evento publicado: {} en {}", accion, servicio);
        } catch (Exception e) {
            log.error("Error publicando evento de auditoría: {}", e.getMessage());
        }
    }
}
