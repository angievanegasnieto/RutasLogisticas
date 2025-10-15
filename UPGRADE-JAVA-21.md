Upgrade to Java 21 (LTS)

This repository has been updated to target Java 21. The `pom.xml` files for `auth` and `gateway` were changed to set `<java.version>21` and to add the `maven-compiler-plugin` configured with `release ${java.version}`.

On Windows (PowerShell), follow these steps to build and verify locally:

1. Install JDK 21 (Eclipse Temurin/Adoptium recommended) and Apache Maven.
2. Add their `bin` folders to your PATH or use full paths.

Verify installations:

```powershell
java -version
where.exe java
where.exe mvn
```

Build modules (from repo root):

```powershell
# Build auth module
cd .\auth\RutasLogisticas
mvn -DskipTests package

# Build gateway module
cd ..\..\gateway
mvn -DskipTests package
```

Notes:

- If you don't have `mvn` on PATH, use the project wrapper `mvnw` if present (e.g. `./mvnw -DskipTests package`).
- If you encounter compilation issues after switching to Java 21, check library compatibility and consider updating Spring Boot / Spring Cloud versions accordingly.
