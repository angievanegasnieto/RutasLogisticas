# 🧪 Pruebas de la API de Geocodificación

## ⚡ Prueba Rápida

### 1. Verificar que el servicio está disponible

```bash
curl http://localhost:8080/api/geocodificacion/info
```

**Respuesta esperada:**
```json
{
  "servicio": "Geocodificación LocationIQ",
  "version": "1.0",
  "descripcion": "Convierte direcciones en coordenadas geográficas (latitud/longitud)",
  "proveedor": "LocationIQ",
  "limiteDiario": "10,000 peticiones (cuenta gratuita)",
  "documentacion": "https://locationiq.com/docs",
  "ejemploRequest": {
    "direccion": "Calle 123 #45-67",
    "ciudad": "Bogotá",
    "departamento": "Cundinamarca",
    "pais": "Colombia"
  }
}
```

---

### 2. Geocodificar una dirección (Ejemplo 1: Bogotá)

```bash
curl -X POST http://localhost:8080/api/geocodificacion \
  -H "Content-Type: application/json" \
  -d '{
    "direccion": "Carrera 7 #32-16",
    "ciudad": "Bogotá",
    "departamento": "Cundinamarca",
    "pais": "Colombia"
  }'
```

**Respuesta esperada:**
```json
{
  "exitoso": true,
  "latitud": "4.6097100",
  "longitud": "-74.0817500",
  "direccionFormateada": "Carrera 7, Bogotá, Cundinamarca, Colombia",
  "precision": "CALLE",
  "importancia": "0.625"
}
```

---

### 3. Geocodificar una dirección (Ejemplo 2: Medellín)

```bash
curl -X POST http://localhost:8080/api/geocodificacion \
  -H "Content-Type: application/json" \
  -d '{
    "direccion": "Calle 10 #38-45",
    "ciudad": "Medellín",
    "departamento": "Antioquia",
    "pais": "Colombia"
  }'
```

**Respuesta esperada:**
```json
{
  "exitoso": true,
  "latitud": "6.2442",
  "longitud": "-75.5812",
  "direccionFormateada": "Calle 10, Medellín, Antioquia, Colombia",
  "precision": "ALTA",
  "importancia": "0.71"
}
```

---

### 4. Geocodificar sin departamento (usa por defecto Colombia)

```bash
curl -X POST http://localhost:8080/api/geocodificacion \
  -H "Content-Type: application/json" \
  -d '{
    "direccion": "Carrera 15 #93-30",
    "ciudad": "Bogotá"
  }'
```

---

### 5. Validar una dirección (sin geocodificar)

```bash
curl "http://localhost:8080/api/geocodificacion/validar?direccion=Calle%20123&ciudad=Bogotá"
```

**Respuesta esperada:**
```json
{
  "valida": true,
  "errores": ""
}
```

---

### 6. Validar dirección inválida

```bash
curl "http://localhost:8080/api/geocodificacion/validar?direccion=ABC&ciudad=Bogotá"
```

**Respuesta esperada:**
```json
{
  "valida": false,
  "errores": "La dirección es demasiado corta."
}
```

---

### 7. Geocodificar múltiples direcciones (Batch)

```bash
curl -X POST http://localhost:8080/api/geocodificacion/batch \
  -H "Content-Type: application/json" \
  -d '{
    "direcciones": [
      {
        "id": 1,
        "direccion": "Carrera 7 #32-16",
        "ciudad": "Bogotá",
        "departamento": "Cundinamarca",
        "pais": "Colombia"
      },
      {
        "id": 2,
        "direccion": "Calle 10 #38-45",
        "ciudad": "Medellín",
        "departamento": "Antioquia",
        "pais": "Colombia"
      },
      {
        "id": 3,
        "direccion": "Avenida El Dorado",
        "ciudad": "Bogotá",
        "departamento": "Cundinamarca",
        "pais": "Colombia"
      }
    ]
  }'
```

**Respuesta esperada:**
```json
{
  "total": 3,
  "exitosos": 3,
  "fallidos": 0,
  "resultados": [
    {
      "id": 1,
      "exitoso": true,
      "latitud": "4.6097",
      "longitud": "-74.0817",
      "direccionFormateada": "Carrera 7, Bogotá...",
      "precision": "ALTA"
    },
    {
      "id": 2,
      "exitoso": true,
      "latitud": "6.2442",
      "longitud": "-75.5812",
      "direccionFormateada": "Calle 10, Medellín...",
      "precision": "MEDIA"
    },
    {
      "id": 3,
      "exitoso": true,
      "latitud": "4.7110",
      "longitud": "-74.0721",
      "direccionFormateada": "Avenida El Dorado...",
      "precision": "CALLE"
    }
  ]
}
```

---

## ❌ Casos de Error

### Error: Dirección vacía

```bash
curl -X POST http://localhost:8080/api/geocodificacion \
  -H "Content-Type: application/json" \
  -d '{
    "direccion": "",
    "ciudad": "Bogotá"
  }'
```

**Respuesta (400):**
```json
{
  "exitoso": false,
  "error": "La dirección es obligatoria"
}
```

---

### Error: Ciudad vacía

```bash
curl -X POST http://localhost:8080/api/geocodificacion \
  -H "Content-Type: application/json" \
  -d '{
    "direccion": "Calle 123",
    "ciudad": ""
  }'
```

**Respuesta (400):**
```json
{
  "exitoso": false,
  "error": "La ciudad es obligatoria"
}
```

---

### Error: Dirección muy corta

```bash
curl -X POST http://localhost:8080/api/geocodificacion \
  -H "Content-Type: application/json" \
  -d '{
    "direccion": "ABC",
    "ciudad": "Bogotá"
  }'
```

**Respuesta (400):**
```json
{
  "exitoso": false,
  "error": "La dirección es demasiado corta (mínimo 5 caracteres)"
}
```

---

### Error: Dirección no encontrada

```bash
curl -X POST http://localhost:8080/api/geocodificacion \
  -H "Content-Type: application/json" \
  -d '{
    "direccion": "Calle inexistente 999999",
    "ciudad": "Ciudad Ficticia"
  }'
```

**Respuesta (500):**
```json
{
  "exitoso": false,
  "error": "No se encontraron resultados para la dirección proporcionada"
}
```

---

## 🎨 Colección Postman

### Importar en Postman:

1. Abre Postman
2. Click en "Import"
3. Pega este JSON:

```json
{
  "info": {
    "name": "Geocodificación API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Info del Servicio",
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "http://localhost:8080/api/geocodificacion/info",
          "protocol": "http",
          "host": ["localhost"],
          "port": "8080",
          "path": ["api", "geocodificacion", "info"]
        }
      }
    },
    {
      "name": "Geocodificar Dirección",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"direccion\": \"Carrera 7 #32-16\",\n  \"ciudad\": \"Bogotá\",\n  \"departamento\": \"Cundinamarca\",\n  \"pais\": \"Colombia\"\n}"
        },
        "url": {
          "raw": "http://localhost:8080/api/geocodificacion",
          "protocol": "http",
          "host": ["localhost"],
          "port": "8080",
          "path": ["api", "geocodificacion"]
        }
      }
    },
    {
      "name": "Validar Dirección",
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "http://localhost:8080/api/geocodificacion/validar?direccion=Calle 123&ciudad=Bogotá",
          "protocol": "http",
          "host": ["localhost"],
          "port": "8080",
          "path": ["api", "geocodificacion", "validar"],
          "query": [
            {
              "key": "direccion",
              "value": "Calle 123"
            },
            {
              "key": "ciudad",
              "value": "Bogotá"
            }
          ]
        }
      }
    },
    {
      "name": "Geocodificar Batch",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"direcciones\": [\n    {\n      \"id\": 1,\n      \"direccion\": \"Carrera 7 #32-16\",\n      \"ciudad\": \"Bogotá\",\n      \"departamento\": \"Cundinamarca\",\n      \"pais\": \"Colombia\"\n    },\n    {\n      \"id\": 2,\n      \"direccion\": \"Calle 10 #38-45\",\n      \"ciudad\": \"Medellín\",\n      \"departamento\": \"Antioquia\",\n      \"pais\": \"Colombia\"\n    }\n  ]\n}"
        },
        "url": {
          "raw": "http://localhost:8080/api/geocodificacion/batch",
          "protocol": "http",
          "host": ["localhost"],
          "port": "8080",
          "path": ["api", "geocodificacion", "batch"]
        }
      }
    }
  ]
}
```

---

## 📊 Interpretación de Precisión

| Precisión | Significado | Color Badge |
|-----------|-------------|-------------|
| `EXACTA` | Edificio/Casa específica | Verde |
| `ALTA` | Importancia > 0.5 | Azul |
| `MEDIA` | Importancia > 0.3 | Naranja |
| `BAJA` | Importancia ≤ 0.3 | Rojo |
| `CALLE` | Nivel de calle/vía | Rojo |

---

## 🔍 Verificación Visual

Una vez geocodificadas las direcciones, puedes verificar las coordenadas en:

**Google Maps:**
```
https://www.google.com/maps?q=4.6097,-74.0817
```

**OpenStreetMap:**
```
https://www.openstreetmap.org/?mlat=4.6097&mlon=-74.0817&zoom=16
```

Reemplaza las coordenadas con las obtenidas de la API.
