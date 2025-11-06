# Proyecto Rutas Logísticas

Sistema de gestión de rutas logísticas con **Angular (Frontend)**, **Spring Boot (Backend/Auth)** y **MySQL**.

## Requisitos
- Docker y Docker Compose.
- (Opcional para desarrollo) Node 18+ y npm.
- (Opcional para build local) JDK 21 y Maven.

## Estructura
- `backend/RutasLogisticas`: API principal (Spring Boot 8080).
- `auth/RutasLogisticas`: Servicio de autenticación con JWT (Spring Boot 8081).
- `gateway`: API Gateway (Spring Cloud, 8082).
- `frontend/frontend-app`: SPA Angular (ng build → Nginx).
- `db/isql`: Script de inicialización de la base.

## Variables de entorno
Archivo `.env` en la raíz (incluido):

```
MYSQL_ROOT_PASSWORD=root
MYSQL_DATABASE=logisticsdb
MYSQL_PORT=3307
BACKEND_PORT=8080
AUTH_PORT=8081
GATEWAY_PORT=8082
FRONTEND_PORT=4200
```

Puedes cambiar los puertos en el `.env` y `docker-compose.yml` los respetará.

## Ejecutar con Docker Compose

Desde la raíz del repo:

```bash
docker compose up --build
```

Servicios y puertos:
- Frontend: http://localhost:4200 (sirve la SPA con Nginx)
- Auth: http://localhost:8081
- Backend: http://localhost:8080
- Gateway: http://localhost:8082
- MySQL: localhost:3307 (internamente como `db:3306`)

La SPA consume `/auth/**` (auth-service) y `/api/**` (backend) a través de Nginx dentro del contenedor.

## Desarrollo del Frontend (local sin Docker)

```bash
cd frontend/frontend-app
npm install
npm start
```

El servidor de desarrollo usa `proxy.conf.json` para enrutar:
- `/auth` → `http://localhost:8081`
- `/api` → `http://localhost:8080`

## Builds locales (opcional)
Consulta `UPGRADE-JAVA-21.md` para comandos con Maven y JDK 21.

## Notas de mantenimiento
- Se consolidó el frontend en `frontend/frontend-app` y se eliminaron duplicados en `frontend/`.
- Nginx del frontend ya enruta `/auth` al servicio de auth y `/api` al backend.
- Si prefieres que todo el tráfico pase por el gateway, se puede actualizar Nginx/proxy para apuntar a `gateway:8082`.

## Problemas comunes
- Puertos ya en uso: cambia valores en `.env` y vuelve a levantar.
- Errores de conexión a MySQL: revisa logs del contenedor `mysql_db` y credenciales en `application.properties`.
- 404 en rutas de Angular: la configuración de Nginx ya incluye `try_files` para servir `index.html`.

## Usuarios y registro
- No hay registro público en el frontend.
- El endpoint `POST /auth/register` está restringido para ADMIN una vez existe al menos un usuario en la base.
- Bootstrap (solo la primera vez): si la tabla de usuarios está vacía, `POST /auth/register` permite crear el primer usuario (por ejemplo un ADMIN). A partir de entonces, solo un administrador autenticado puede crear cuentas.
