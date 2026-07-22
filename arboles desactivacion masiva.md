# 🌳 Árboles, Hojas y Desactivación Masiva

Este documento detalla las estrategias para manejar la desactivación de entidades en estructuras jerárquicas (Árboles), específicamente aplicado al caso de **Zonas (Ramas)** y **Espacios (Hojas)**.

## 1. Contexto del Proyecto

En nuestro sistema de gestión de espacios:
- **Rama (Padre):** `Zona`
- **Hoja (Hijo):** `Espacio`

Cuando una `Zona` se desactiva, todos sus `Espacios` asociados deben desactivarse automáticamente para mantener la integridad lógica del sistema.

Por ejemplo: si se desactiva la *Zona "Edificio A"*, entonces *Espacio "Salón 101"*, *Espacio "Salón 102"* y *Espacio "Auditorio"* también deben quedar inactivos.

---

## 2. Estrategias de Desactivación Masiva

### Estrategia 1: Desactivación Manual (Síncrona) — Paso a Paso

En esta estrategia, el servicio de `Zona` recupera explícitamente todos los `Espacio` asociados y los actualiza uno por uno dentro de un bucle.

#### Código de ejemplo

```java
@Service
public class ZonaServicioImpl implements ZonaServicio {

    @Autowired
    private ZonaRepositorio zonaRepositorio;

    @Autowired
    private EspacioRepositorio espacioRepositorio;

    @Override
    @Transactional
    public Boolean activarDesactivar(UUID idZona) {
        Zona zona = zonaRepositorio.findById(idZona)
                .orElseThrow(() -> new ZonaNoEncontradaException(idZona));

        int nuevoEstado = (zona.getActivo() == 1) ? 0 : 1;
        zona.setActivo(nuevoEstado);
        zonaRepositorio.save(zona);

        if (nuevoEstado == 0) {
            // Desactivar todos los espacios hijos
            List<Espacio> espacios = espacioRepositorio.findByZonaId(idZona);
            for (Espacio espacio : espacios) {
                espacio.setActivo(false);
                // Se lanzan @PreUpdate, @PreUpdate, etc. en cada save
                espacioRepositorio.save(espacio);
            }
        }

        return nuevoEstado == 1;
    }
}
```

#### 📊 Análisis de rendimiento (N+1 Problem)

El principal problema de esta estrategia es el **N+1 de escrituras**. En lugar de una sola sentencia SQL, se ejecutan:

```
1 SELECT para la Zona
1 SELECT para los Espacios (puede ser N+1 si no se usa JOIN FETCH)
N sentencias UPDATE (una por cada Espacio)
```

Si una zona tiene **10,000 espacios**, se ejecutarán **~10,002 operaciones** contra la base de datos. Esto puede tardar varios segundos o incluso minutos en redes con latencia.

#### 🔄 Transaccionalidad

Aunque todo el método está anotado con `@Transactional`, el bloqueo de la transacción se mantiene durante todo el bucle, lo que puede provocar:
- **Deadlocks** si otros procesos intentan modificar los mismos espacios.
- **Timeouts** de conexión si el bucle es muy grande.
- **Consumo de memoria** por la lista completa de espacios cargados en el `PersistenceContext`.

#### 💡 Optimización posible con `saveAll` y flushing por lotes

```java
if (nuevoEstado == 0) {
    List<Espacio> espacios = espacioRepositorio.findByZonaId(idZona);
    for (Espacio espacio : espacios) {
        espacio.setActivo(false);
    }
    espacioRepositorio.saveAll(espacios);  // Un solo flush agrupado
}
```

En `application.yml` se puede configurar el tamaño del lote para mejorar aún más:

```yaml
spring:
  jpa:
    properties:
      hibernate:
        jdbc:
          batch_size: 30
        order_inserts: true
        order_updates: true
```

Con `saveAll` y `batch_size = 30`, hibernate generará **~334 lotes de UPDATE** para 10,000 registros en lugar de 10,000 sentencias individuales. Sigue siendo ineficiente, pero notablemente mejor.

#### 📋 Evaluación completa

| Aspecto | Valoración |
|---|---|
| Complejidad de implementación | 🟢 Muy baja |
| Rendimiento con pocos hijos (< 100) | 🟢 Aceptable |
| Rendimiento con muchos hijos (> 1,000) | 🔴 Muy malo |
| Consistencia de datos | 🟢 Garantizada por transacción |
| Respeto de lifecycle JPA (@PreUpdate, etc.) | 🟢 Sí |
| Acoplamiento entre servicios | 🔴 Alto (Zona conoce a Espacio) |
| Mantenibilidad | 🟡 Media |
| Testeabilidad | 🟢 Fácil |

---

### Estrategia 2: Cascada a nivel de Base de Datos

Consiste en delegar la lógica de desactivación al motor de base de datos mediante **restricciones CASCADE**, **claves foráneas** o **TRIGGERS**.

#### 2A. Usando `FOREIGN KEY` con `ON UPDATE CASCADE`

```sql
ALTER TABLE espacios
ADD CONSTRAINT fk_espacios_zona
FOREIGN KEY (id_zona) REFERENCES zonas(id)
ON UPDATE CASCADE;
```

Al actualizar `zonas.activo = 0`:

```sql
UPDATE zonas SET activo = 0 WHERE id = '...';
```

La base de datos propaga automáticamente el cambio si definimos una columna `activo` en `espacios` que tome el valor de la zona padre. **Sin embargo**, `ON UPDATE CASCADE` sólo replica el valor de la columna referenciada; no permite lógica condicional ni ejecutar procedimientos adicionales.

#### 2B. Usando un TRIGGER `BEFORE UPDATE` o `AFTER UPDATE`

Un **TRIGGER** ofrece control total sobre la lógica de propagación.

```sql
CREATE OR REPLACE FUNCTION desactivar_espacios_por_zona()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.activo = 0 AND OLD.activo = 1 THEN
        UPDATE espacios
        SET activo = false
        WHERE id_zona = NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_zona_after_update
    AFTER UPDATE ON zonas
    FOR EACH ROW
    WHEN (NEW.activo = 0 AND OLD.activo = 1)
    EXECUTE FUNCTION desactivar_espacios_por_zona();
```

#### ⚠️ Problemas con TRIGGERS

1. **Lógica oculta:** Un desarrollador que lea `ZonaServicio.activarDesactivar()` no sabrá que existe un trigger modificando `espacios`. Esto lleva a bugs difíciles de depurar.
2. **Versionamiento:** Los triggers viven en la base de datos. Se necesita una herramienta como **Flyway** o **Liquibase** para versionarlos.
3. **Testeabilidad:** No se pueden simular los triggers en tests unitarios. Las pruebas requieren una base de datos real (Testcontainers o H2 con modo PostgreSQL).
4. **Depuración:** No se puede poner un breakpoint dentro de un trigger. Si algo falla, el error suele ser genérico (`ERROR: 42P01`).
5. **Portabilidad:** Cambiar de PostgreSQL a MySQL o SQL Server implica reescribir los triggers en el dialecto correspondiente.

#### 🧪 Cómo testear un trigger con Testcontainers

```java
@Testcontainers
class ZonaTriggerTest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:15");

    @Autowired
    private JdbcTemplate jdbc;

    @Test
    void debeDesactivarEspaciosCuandoZonaSeDesactiva() {
        jdbc.execute("INSERT INTO zonas(id, activo) VALUES ('z1', 1)");
        jdbc.execute("INSERT INTO espacios(id, id_zona, activo) VALUES ('e1', 'z1', true)");
        jdbc.execute("INSERT INTO espacios(id, id_zona, activo) VALUES ('e2', 'z1', true)");

        jdbc.execute("UPDATE zonas SET activo = 0 WHERE id = 'z1'");

        Integer activos = jdbc.queryForObject(
                "SELECT COUNT(*) FROM espacios WHERE activo = true", Integer.class);
        assertThat(activos).isZero();
    }
}
```

#### 📋 Evaluación completa

| Aspecto | Valoración |
|---|---|
| Complejidad de implementación | 🟡 Media (requiere SQL avanzado) |
| Rendimiento | 🟢 Máximo (una sola operación en DB) |
| Consistencia de datos | 🟢 Garantizada por el motor |
| Respeto de lifecycle JPA | 🔴 No (se salta JPA por completo) |
| Acoplamiento entre servicios | 🟢 Bajo (DB maneja todo) |
| Mantenibilidad | 🔴 Mala (lógica invisible en código) |
| Testeabilidad | 🔴 Difícil (requiere DB real) |
| Portabilidad | 🔴 Nula (dependiente del motor SQL) |
| Versionamiento | 🔴 Requiere Flyway/Liquibase |

---

### Estrategia 3: Actualización por Lote (Bulk Update) con JPA

Consiste en ejecutar una única sentencia `UPDATE` a nivel de base de datos usando `@Modifying` y `@Query` de Spring Data JPA.

#### Código de ejemplo

```java
@Repository
public interface EspacioRepositorio extends JpaRepository<Espacio, UUID> {

    @Modifying
    @Query("UPDATE Espacio e SET e.activo = :estado WHERE e.zona.id = :idZona")
    int actualizarEstadoPorZona(@Param("idZona") UUID idZona, @Param("estado") boolean estado);
}
```

En el servicio:

```java
@Service
public class ZonaServicioImpl implements ZonaServicio {

    @Autowired
    private ZonaRepositorio zonaRepositorio;

    @Autowired
    private EspacioRepositorio espacioRepositorio;

    @Override
    @Transactional
    public Boolean activarDesactivar(UUID idZona) {
        Zona zona = zonaRepositorio.findById(idZona)
                .orElseThrow(() -> new ZonaNoEncontradaException(idZona));

        int nuevoEstado = (zona.getActivo() == 1) ? 0 : 1;
        zona.setActivo(nuevoEstado);
        zonaRepositorio.save(zona);

        if (nuevoEstado == 0) {
            int registrosAfectados = espacioRepositorio.actualizarEstadoPorZona(idZona, false);
            log.info("{} espacios desactivados para zona {}", registrosAfectados, idZona);
        }

        return nuevoEstado == 1;
    }
}
```

#### ⚠️ El problema de `@Modifying` y el lifecycle de JPA

Cuando se ejecuta `@Modifying`, Hibernate lanza una **sentencia SQL nativa** (`UPDATE`). Esto significa:

- ❌ **No se ejecutan** `@PreUpdate`, `@PreRemove`, ni ningún callback de ciclo de vida JPA.
- ❌ **No se disparan** eventos de Hibernate como `FlushEntityEvent`.
- ❌ **La caché de primer nivel (PersistenceContext) no se sincroniza** automáticamente.

##### Solución: Limpiar el PersistenceContext

```java
@Modifying(clearAutomatically = true, flushAutomatically = true)
@Query("UPDATE Espacio e SET e.activo = :estado WHERE e.zona.id = :idZona")
int actualizarEstadoPorZona(@Param("idZona") UUID idZona, @Param("estado") boolean estado);
```

- `flushAutomatically = true`: Fuerza un `flush()` antes de ejecutar la query, asegurando que cambios pendientes se persistan.
- `clearAutomatically = true`: Ejecuta `clear()` después de la query, evitando que la entidad desactualizada permanezca en el contexto de persistencia.

#### 🔄 ¿Qué hacer si necesitas ejecutar lógica por cada `Espacio`?

Si necesitas que se dispare `@PreUpdate` (ej. para actualizar un campo `fechaModificacion`), hay dos opciones:

**Opción A — Bulk update con SQL que incluya la lógica:**

```java
@Modifying(clearAutomatically = true, flushAutomatically = true)
@Query("UPDATE Espacio e SET e.activo = :estado, e.fechaModificacion = CURRENT_TIMESTAMP WHERE e.zona.id = :idZona")
int actualizarEstadoPorZona(@Param("idZona") UUID idZona, @Param("estado") boolean estado);
```

**Opción B — Evento de dominio (Estrategia 4), que sí pasa por JPA completo.**

#### 📋 Evaluación completa

| Aspecto | Valoración |
|---|---|
| Complejidad de implementación | 🟢 Baja |
| Rendimiento | 🟢 Muy alto (1 solo UPDATE) |
| Consistencia de datos | 🟡 Media (riesgo de cachón inconsistente si no se usa `clearAutomatically`) |
| Respeto de lifecycle JPA | 🔴 No (se salta @PreUpdate) |
| Acoplamiento entre servicios | 🟡 Medio (Zona sigue llamando a repositorio de Espacio) |
| Mantenibilidad | 🟢 Buena |
| Testeabilidad | 🟢 Fácil |
| Claridad de la intención | 🟢 Alta (un UPDATE es muy explícito) |

---

### Estrategia 4: Eventos de Dominio (Event-Driven) — Detalle Completo

Esta estrategia busca desacoplar la lógica de la **Zona** de las consecuencias que esta tiene sobre los **Espacios**. En lugar de que `ZonaServicio` "sepa" cómo desactivar espacios, simplemente anuncia que la zona ha cambiado mediante un **evento de dominio**.

#### 🛠️ Implementación Detallada en el Proyecto

##### A. Definición del Evento

Creamos una clase POJO inmutable para transportar la información del cambio.

```java
public class ZonaEstadoCambiadoEvent {

    private final UUID idZona;
    private final boolean estaActiva;
    private final Instant ocurridoEn;

    public ZonaEstadoCambiadoEvent(UUID idZona, boolean estaActiva) {
        this.idZona = idZona;
        this.estaActiva = estaActiva;
        this.ocurridoEn = Instant.now();
    }

    public UUID getIdZona() { return idZona; }
    public boolean isEstaActiva() { return estaActiva; }
    public Instant getOcurridoEn() { return ocurridoEn; }
}
```

> **Recomendación:** Mantén los eventos como clases **inmutables** y con un **timestamp** de ocurrencia para facilitar la depuración y auditoría.

##### B. Publicación del Evento

En `ZonaServicioImpl`, inyectamos `ApplicationEventPublisher` y lanzamos el evento después de confirmar el cambio en la zona.

```java
@Service
public class ZonaServicioImpl implements ZonaServicio {

    private final ZonaRepositorio zonaRepositorio;
    private final ApplicationEventPublisher eventPublisher;

    public ZonaServicioImpl(ZonaRepositorio zonaRepositorio,
                            ApplicationEventPublisher eventPublisher) {
        this.zonaRepositorio = zonaRepositorio;
        this.eventPublisher = eventPublisher;
    }

    @Override
    @Transactional
    public Boolean activarDesactivar(UUID idZona) {
        Zona zona = zonaRepositorio.findById(idZona)
                .orElseThrow(() -> new ZonaNoEncontradaException(idZona));

        int nuevoEstado = (zona.getActivo() == 1) ? 0 : 1;
        zona.setActivo(nuevoEstado);
        zonaRepositorio.save(zona);

        // Publicamos el evento — esto se dispara dentro de la misma transacción
        eventPublisher.publishEvent(new ZonaEstadoCambiadoEvent(idZona, nuevoEstado == 1));

        return nuevoEstado == 1;
    }
}
```

> **Nota:** Usamos **constructor injection** en lugar de `@Autowired` por ser la práctica recomendada (inmutabilidad, testeabilidad).

##### C. Escuchador (Listener) Síncrono

Creamos un componente que reacciona al evento y ejecuta la desactivación masiva vía el servicio de `Espacio`.

```java
@Component
public class EspacioEventListener {

    private final EspacioServicio espacioServicio;

    public EspacioEventListener(EspacioServicio espacioServicio) {
        this.espacioServicio = espacioServicio;
    }

    @EventListener
    @Transactional(propagation = Propagation.REQUIRED)
    public void manejarCambioEstadoZona(ZonaEstadoCambiadoEvent event) {
        if (!event.isEstaActiva()) {
            espacioServicio.desactivarEspaciosPorZona(event.getIdZona());
        }
    }
}
```

##### D. Escuchador Asíncrono (Opcional pero Recomendado)

Para que la respuesta al usuario sea inmediata, podemos ejecutar la desactivación en segundo plano.

1. Habilitar async en la aplicación:

```java
@SpringBootApplication
@EnableAsync
public class AppDistribuidasApplication {
    public static void main(String[] args) {
        SpringApplication.run(AppDistribuidasApplication.class, args);
    }
}
```

2. Crear un **`AsyncConfigurer`** personalizado con un pool de hilos dedicado:

```java
@Configuration
@EnableAsync
public class AsyncConfig implements AsyncConfigurer {

    @Override
    public Executor getAsyncExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(2);
        executor.setMaxPoolSize(5);
        executor.setQueueCapacity(100);
        executor.setThreadNamePrefix("event-listener-");
        executor.initialize();
        return executor;
    }

    @Override
    public AsyncUncaughtExceptionHandler getAsyncUncaughtExceptionHandler() {
        return (ex, method, params) ->
                log.error("Error en listener asíncrono {}({})", method.getName(), params, ex);
    }
}
```

3. Agregar `@Async` al listener:

```java
@Component
public class EspacioEventListener {

    private final EspacioServicio espacioServicio;

    public EspacioEventListener(EspacioServicio espacioServicio) {
        this.espacioServicio = espacioServicio;
    }

    @EventListener
    @Async
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void manejarCambioEstadoZona(ZonaEstadoCambiadoEvent event) {
        if (!event.isEstaActiva()) {
            log.info("Desactivando espacios para zona {} de forma asíncrona", event.getIdZona());
            espacioServicio.desactivarEspaciosPorZona(event.getIdZona());
        }
    }
}
```

> **⚠️ Importante:** Al usar `@Async` junto con `@Transactional`, se debe usar `Propagation.REQUIRES_NEW`. Esto es porque el hilo del listener no participa en la transacción original del publicador, por lo que necesita una nueva transacción independiente.

##### E. Manejando errores en listeners asíncronos

Con `@Async`, las excepciones lanzadas en el listener no afectan al hilo principal. Para manejarlas:

```java
@Override
public AsyncUncaughtExceptionHandler getAsyncUncaughtExceptionHandler() {
    return (ex, method, params) -> {
        // Log del error
        log.error("Error en {}: {}", method.getName(), ex.getMessage(), ex);

        // Opcional: enviar a un dead-letter queue o reintentar
        if (params.length > 0 && params[0] instanceof ZonaEstadoCambiadoEvent event) {
            eventDeadLetterQueue.offer(event);
        }
    };
}
```

##### F. Listeners ordenados

Si hay múltiples listeners que deben ejecutarse en un orden específico:

```java
@Component
public class AuditoriaEventListener {

    @EventListener
    @Order(1)
    public void registrarAuditoria(ZonaEstadoCambiadoEvent event) {
        // Registrar en bitácora
    }
}

@Component
public class NotificacionEventListener {

    @EventListener
    @Order(2)
    public void enviarNotificacion(ZonaEstadoCambiadoEvent event) {
        // Enviar email o push
    }
}

@Component
public class EspacioEventListener {

    @EventListener
    @Order(3)
    public void manejarCambioEstadoZona(ZonaEstadoCambiadoEvent event) {
        // Desactivar espacios
    }
}
```

##### G. Eventos condicionales

Podemos usar `@EventListener(condition = "...")` con SpEL para filtrar eventos:

```java
@EventListener(condition = "#event.estaActiva == false")
public void soloCuandoSeDesactiva(ZonaEstadoCambiadoEvent event) {
    espacioServicio.desactivarEspaciosPorZona(event.getIdZona());
}

@EventListener(condition = "#event.estaActiva == true")
public void soloCuandoSeActiva(ZonaEstadoCambiadoEvent event) {
    espacioServicio.activarEspaciosPorZona(event.getIdZona());
}
```

##### H. Integración con Message Broker (RabbitMQ / Kafka)

Si en el futuro el sistema crece y se necesitan múltiples instancias o microservicios separados, los eventos de dominio pueden migrarse fácilmente a un **message broker** externo.

```java
// Abstracción del publicador
public interface EventPublisher {
    void publish(Object event);
}

// Implementación en memoria (SpringEvents)
@Component
@ConditionalOnProperty(name = "events.mode", havingValue = "sync", matchIfMissing = true)
public class SpringEventPublisher implements EventPublisher {
    @Autowired private ApplicationEventPublisher publisher;
    public void publish(Object event) { publisher.publishEvent(event); }
}

// Implementación con RabbitMQ
@Component
@ConditionalOnProperty(name = "events.mode", havingValue = "rabbitmq")
public class RabbitEventPublisher implements EventPublisher {
    @Autowired private RabbitTemplate rabbitTemplate;
    public void publish(Object event) {
        rabbitTemplate.convertAndSend("zonas.exchange", "zonas.estado.cambiado", event);
    }
}
```

#### ✅ Beneficios de esta Implementación

1. **Desacoplamiento total:** `ZonaServicio` no tiene dependencia alguna de `EspacioServicio` ni de `EspacioRepositorio`.
2. **Escalabilidad futura:** Si mañana se necesita enviar un email, registrar auditoría, actualizar un cache, o notificar a un websocket, solo se agrega un nuevo `@EventListener` sin modificar el código existente.
3. **Separación de responsabilidades:** La lógica de "qué pasa con los espacios" pertenece exclusivamente al dominio de Espacios.
4. **Asincronía nativa:** Con `@Async`, la respuesta al usuario es inmediata y el trabajo pesado ocurre en segundo plano.
5. **Transaccionalidad flexible:** Cada listener puede tener su propia transacción con el nivel de aislamiento adecuado.
6. **Respeto del lifecycle JPA:** Como el listener llama a `EspacioServicio` (que sí usa repositorios JPA), los callbacks `@PreUpdate`, `@PrePersist`, etc. se ejecutan correctamente.
7. **Testeabilidad:** Se pueden publicar eventos directamente en los tests y verificar que el listener reacciona correctamente.

#### 🧪 Test del flujo de eventos

```java
@SpringBootTest
class ZonaServicioEventTest {

    @Autowired
    private ZonaServicio zonaServicio;

    @Autowired
    private EspacioRepositorio espacioRepositorio;

    @MockitoBean
    private EmailServicio emailServicio;  // Simulamos servicios externos

    @Test
    void desactivarZona_debeDesactivarEspacios() {
        // Arrange
        UUID zonaId = // ... crear zona con espacios

        // Act
        zonaServicio.activarDesactivar(zonaId);

        // Assert
        List<Espacio> espacios = espacioRepositorio.findByZonaId(zonaId);
        assertThat(espacios).allMatch(e -> !e.isActivo());
    }
}
```

#### 📋 Evaluación completa

| Aspecto | Valoración |
|---|---|
| Complejidad de implementación | 🟡 Media (3 clases nuevas + config) |
| Rendimiento | 🟢 Alto (UPDATE masivo dentro del listener) |
| Desacoplamiento | 🟢 Total |
| Escalabilidad futura | 🟢 Máxima (agregar listeners es trivial) |
| Respeto de lifecycle JPA | 🟢 Sí (si el listener usa JPA) |
| Mantenibilidad | 🟢 Excelente |
| Testeabilidad | 🟢 Alta |
| Asincronía | 🟢 Opcional y configurable |

---

## 3. Tabla Comparativa Final

| Estrategia | Rendimiento | Desacoplamiento | Lifecycle JPA | Mantenibilidad | Complejidad |
|---|---|---|---|---|---|
| **1 — Manual síncrona** | 🔴 Muy bajo | 🔴 Alto acoplamiento | 🟢 Sí | 🟡 Media | 🟢 Baja |
| **2 — Cascada DB** | 🟢 Máximo | 🟢 Bajo acoplamiento | 🔴 No | 🔴 Mala | 🟡 Media |
| **3 — Bulk Update** | 🟢 Alto | 🟡 Acoplamiento medio | 🔴 No | 🟢 Buena | 🟢 Baja |
| **4 — Eventos de Dominio** | 🟢 Alto | 🟢 Sin acoplamiento | 🟢 Sí | 🟢 Excelente | 🟡 Media |

## 4. Conclusión

Para este proyecto, la **Estrategia 4 (Eventos de Dominio)** es la más robusta arquitectónicamente. Permite que el microservicio de Zonas-Espacios crezca de forma ordenada, siga los principios de **Diseño Orientado al Dominio (DDD)** y facilite la incorporación de nuevas funcionalidades reactivas sin modificar el código existente.

La combinación de:
- **`@EventListener`** para el desacoplamiento,
- **`@Async`** para no bloquear al usuario,
- **`@Transactional(propagation = REQUIRES_NEW)`** para una transacción independiente,
- y la **abstracción del publicador** para migrar a RabbitMQ/Kafka si es necesario,

hacen de esta estrategia la solución más preparada para el futuro del sistema.
