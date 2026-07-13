package ec.edu.espe.zonas.utils;

import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.rabbit.connection.CachingConnectionFactory;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    @Value("${app.rabbitmq.host:localhost}")
    private String host;

    @Value("${app.rabbitmq.port:5672}")
    private int port;

    @Value("${app.rabbitmq.username:guest}")
    private String username;

    @Value("${app.rabbitmq.password:guest}")
    private String password;

    @Value("${app.rabbitmq.exchange:audit_exchange}")
    private String exchange;

    @Value("${app.rabbitmq.routing-key:audit.event}")
    private String routingKey;

    @Bean
    public ConnectionFactory connectionFactory() {
        CachingConnectionFactory factory = new CachingConnectionFactory(host, port);
        factory.setUsername(username);
        factory.setPassword(password);
        factory.setRequestedHeartBeat(30);
        factory.setConnectionTimeout(10000);
        return factory;
    }

    @Bean
    public TopicExchange auditExchange() {
        return new TopicExchange(exchange, true, false);
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory) {
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setExchange(exchange);
        template.setRoutingKey(routingKey);
        template.setMessageConverter(new Jackson2JsonMessageConverter());
        return template;
    }
}
