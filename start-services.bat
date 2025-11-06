@echo off
REM Script para arrancar auth, backend y gateway en ventanas separadas (cmd.exe)
REM Ejecutar desde la raíz del repo: start-services.bat

echo Iniciando servicios RutasLogisticas: auth (8081), backend (8080) y gateway (8082)

rem Arranca el servicio de auth (módulo auth\RutasLogisticas)
start "Auth Service" cmd /k "pushd "%~dp0auth\RutasLogisticas" && mvn spring-boot:run -Dspring-boot.run.arguments=--server.port=8081"

rem Arranca el servicio de backend (módulo backend\RutasLogisticas)
start "Backend Service" cmd /k "pushd "%~dp0backend\RutasLogisticas" && mvn spring-boot:run -Dspring-boot.run.arguments=--server.port=8080"

rem Arranca el gateway (módulo gateway)
start "Gateway Service" cmd /k "pushd "%~dp0gateway" && mvn spring-boot:run -Dspring-boot.run.arguments=--server.port=8082"

echo Ventanas abiertas. Revisa las consolas para logs y errores.
exit /b 0
