# ---------- Etapa 1: Construcción con Maven ----------
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app

# Copiamos el pom.xml y descargamos dependencias (esto se cachea)
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copiamos el código fuente
COPY src ./src

# Compilamos y empaquetamos (genera un .jar en target/)
RUN mvn clean package -DskipTests

# ---------- Etapa 2: Imagen final con JDK ----------
FROM eclipse-temurin:21-jdk
WORKDIR /app

# Copiamos el jar generado en la etapa anterior
COPY --from=build /app/target/*.jar app.jar

# Puerto expuesto por Spring Boot
EXPOSE 8081

# Comando para ejecutar la aplicación
ENTRYPOINT ["java", "-jar", "app.jar"]
