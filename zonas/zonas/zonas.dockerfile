FROM eclipse-temurin:17-jdk-alpine AS builder

WORKDIR /app

# Copiar archivos de Maven
COPY pom.xml ./
COPY mvnw ./
COPY .mvn ./.mvn

# Copiar código fuente
COPY src ./src

#  Copiar las claves JWT
COPY jwt-keys ./jwt-keys/

# Construir la aplicación
RUN ./mvnw clean package -DskipTests

# Etapa de producción
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Copiar el JAR desde la etapa de builder
COPY --from=builder /app/target/*.jar app.jar

# 🔥 Copiar las claves JWT desde el builder
COPY --from=builder /app/jwt-keys ./jwt-keys/

# Exponer el puerto
EXPOSE 8080

# Comando para ejecutar la aplicación
ENTRYPOINT ["java", "-jar", "app.jar"]