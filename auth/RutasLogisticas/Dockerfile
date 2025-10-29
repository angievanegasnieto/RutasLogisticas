# syntax=docker/dockerfile:1

# --- Etapa de build (Maven + JDK 21)
FROM maven:3.9.9-eclipse-temurin-21 AS build
WORKDIR /app

# Copiamos el proyecto Maven que está en ./auth/RutasLogisticas
COPY RutasLogisticas/pom.xml .
COPY RutasLogisticas/src ./src

# Compilar (sin tests)
RUN mvn -q -DskipTests package

# --- Runtime (JRE 21)
FROM eclipse-temurin:21-jre
WORKDIR /app

# Copiar el jar construido
COPY --from=build /app/target/*.jar app.jar

# Spring mapea SERVER_PORT -> server.port automáticamente
ENV SERVER_PORT=8081
EXPOSE 8081

ENTRYPOINT ["java","-jar","/app/app.jar"]


