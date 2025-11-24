# 🌍 API de Geocodificación con LocationIQ

## 📋 Descripción
API REST para convertir direcciones en coordenadas geográficas (latitud/longitud) usando LocationIQ.

---

## 🔑 Configuración de API Key

1. **Registrarse en LocationIQ:**
   - Ve a: https://locationiq.com/
   - Crea una cuenta gratuita
   - Obten tu API key desde el dashboard

2. **Configurar la API key:**
   - Abre: `backend/RutasLogisticas/src/main/java/rutaslogisticas/Service/GeocodificacionService.java`
   - Reemplaza la línea:
     ```java
     private static final String LOCATIONIQ_API_KEY = "TU_API_KEY_AQUI";
     ```

3. **Límites de la cuenta gratuita:**
   - 10,000 peticiones por día
   - 2 peticiones por segundo

---

## 📡 Endpoints Disponibles

### 1️⃣ Geocodificar una dirección

**Endpoint:** `POST /api/geocodificacion`

**Request Body:**
```json
{
  "direccion": "Calle 123 #45-67",
  "ciudad": "Bogotá",
  "departamento": "Cundinamarca",
  "pais": "Colombia"
}
```

**Respuesta Exitosa (200):**
```json
{
  "exitoso": true,
  "latitud": "4.7110",
  "longitud": "-74.0721",
  "direccionFormateada": "Calle 123 #45-67, Bogotá, Cundinamarca, Colombia",
  "precision": "ALTA",
  "importancia": "0.65"
}
```

**Respuesta con Error (400/500):**
```json
{
  "exitoso": false,
  "error": "La dirección es obligatoria"
}
```

**Tipos de Precisión:**
- `EXACTA`: Dirección exacta encontrada (edificio/casa)
- `CALLE`: Nivel de calle
- `ALTA`: Importancia > 0.5
- `MEDIA`: Importancia > 0.3
- `BAJA`: Importancia <= 0.3

---

### 2️⃣ Validar dirección (sin geocodificar)

**Endpoint:** `GET /api/geocodificacion/validar`

**Query Params:**
- `direccion` (string, requerido)
- `ciudad` (string, requerido)

**Ejemplo:**
```
GET /api/geocodificacion/validar?direccion=Calle 123&ciudad=Bogotá
```

**Respuesta:**
```json
{
  "valida": true,
  "errores": ""
}
```

---

### 3️⃣ Información del servicio

**Endpoint:** `GET /api/geocodificacion/info`

**Respuesta:**
```json
{
  "servicio": "Geocodificación LocationIQ",
  "version": "1.0",
  "descripcion": "Convierte direcciones en coordenadas geográficas",
  "proveedor": "LocationIQ",
  "limiteDiario": "10,000 peticiones",
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

### 4️⃣ Geocodificar múltiples direcciones (Batch)

**Endpoint:** `POST /api/geocodificacion/batch`

**Request Body:**
```json
{
  "direcciones": [
    {
      "id": 1,
      "direccion": "Calle 123 #45-67",
      "ciudad": "Bogotá",
      "departamento": "Cundinamarca",
      "pais": "Colombia"
    },
    {
      "id": 2,
      "direccion": "Carrera 7 #32-16",
      "ciudad": "Medellín",
      "departamento": "Antioquia",
      "pais": "Colombia"
    }
  ]
}
```

**Respuesta:**
```json
{
  "total": 2,
  "exitosos": 2,
  "fallidos": 0,
  "resultados": [
    {
      "id": 1,
      "exitoso": true,
      "latitud": "4.7110",
      "longitud": "-74.0721",
      "direccionFormateada": "...",
      "precision": "ALTA"
    },
    {
      "id": 2,
      "exitoso": true,
      "latitud": "6.2442",
      "longitud": "-75.5812",
      "direccionFormateada": "...",
      "precision": "MEDIA"
    }
  ]
}
```

---

## 🔧 Integración con el Frontend (Angular)

### Opción 1: Geocodificar al guardar dirección

**En `clientes.component.ts`:**

```typescript
geocodificarDireccion(direccion: any) {
  const body = {
    direccion: direccion.direccion,
    ciudad: direccion.ciudad,
    departamento: direccion.departamento,
    pais: direccion.pais || 'Colombia'
  };

  this.http.post<any>('http://localhost:8080/api/geocodificacion', body).subscribe({
    next: (resultado) => {
      if (resultado.exitoso) {
        direccion.lat = parseFloat(resultado.latitud);
        direccion.lng = parseFloat(resultado.longitud);
        direccion.verificada = true;
        direccion.precisionGeocodificacion = resultado.precision;
        
        Swal.fire({
          icon: 'success',
          title: '¡Ubicación encontrada!',
          text: `Precisión: ${resultado.precision}`,
          timer: 2000,
          showConfirmButton: false
        });
      }
    },
    error: (err) => {
      console.error('Error al geocodificar:', err);
      Swal.fire({
        icon: 'warning',
        title: 'No se pudo geocodificar',
        text: 'La dirección se guardará sin coordenadas',
        confirmButtonColor: '#667eea'
      });
    }
  });
}
```

### Opción 2: Botón para geocodificar en el formulario

**En el template:**

```html
<div class="form-group">
  <label><i class="fas fa-map-marker-alt"></i> Dirección *</label>
  <div class="input-with-button">
    <input type="text" class="form-input" [(ngModel)]="dir.direccion" 
           placeholder="Calle 123 #45-67">
    <button type="button" class="btn-geocode" (click)="geocodificarDireccion(dir)">
      <i class="fas fa-map-pin"></i> Geocodificar
    </button>
  </div>
</div>

<!-- Mostrar coordenadas si están disponibles -->
<div *ngIf="dir.lat && dir.lng" class="coordenadas-info">
  <i class="fas fa-check-circle"></i>
  Ubicación: {{dir.lat}}, {{dir.lng}} ({{dir.precisionGeocodificacion}})
</div>
```

### Opción 3: Geocodificar automáticamente al cambiar dirección

```typescript
onDireccionChange(direccion: any, index: number) {
  // Esperar 1 segundo después de que el usuario deje de escribir
  clearTimeout(this.geocodeTimers[index]);
  
  this.geocodeTimers[index] = setTimeout(() => {
    if (direccion.direccion && direccion.ciudad) {
      this.geocodificarDireccion(direccion);
    }
  }, 1000);
}
```

### Opción 4: Geocodificar todas las direcciones antes de guardar

```typescript
async guardarCliente() {
  // Validaciones...
  
  // Geocodificar todas las direcciones
  const promesas = this.clienteForm.direcciones.map(dir => 
    this.geocodificarDireccionAsync(dir)
  );
  
  await Promise.allSettled(promesas);
  
  // Continuar con el guardado normal...
  this.http.post<Cliente>(`${this.apiUrl}/clientes`, this.clienteForm).subscribe({
    // ...
  });
}

geocodificarDireccionAsync(direccion: any): Promise<void> {
  return new Promise((resolve, reject) => {
    const body = {
      direccion: direccion.direccion,
      ciudad: direccion.ciudad,
      departamento: direccion.departamento,
      pais: direccion.pais || 'Colombia'
    };

    this.http.post<any>('http://localhost:8080/api/geocodificacion', body)
      .subscribe({
        next: (resultado) => {
          if (resultado.exitoso) {
            direccion.lat = parseFloat(resultado.latitud);
            direccion.lng = parseFloat(resultado.longitud);
            direccion.verificada = true;
            direccion.precisionGeocodificacion = resultado.precision;
          }
          resolve();
        },
        error: () => resolve() // Continuar aunque falle
      });
  });
}
```

---

## ⚠️ Manejo de Errores

El servicio maneja los siguientes tipos de errores:

### 1. **Errores de Validación (400)**
```json
{
  "exitoso": false,
  "error": "La dirección es obligatoria"
}
```

**Causas:**
- Dirección vacía o null
- Ciudad vacía o null
- Dirección menor a 5 caracteres

### 2. **Errores de Límite de API (500)**
```json
{
  "exitoso": false,
  "error": "Límite de peticiones excedido. Intenta de nuevo en unos minutos."
}
```

### 3. **Errores de Autenticación (500)**
```json
{
  "exitoso": false,
  "error": "Error de autenticación con el servicio de geocodificación. Verifica la API key."
}
```

### 4. **Dirección no encontrada (500)**
```json
{
  "exitoso": false,
  "error": "No se encontraron resultados para la dirección proporcionada"
}
```

---

## 🧪 Pruebas con cURL

### Geocodificar una dirección:
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

### Validar dirección:
```bash
curl "http://localhost:8080/api/geocodificacion/validar?direccion=Calle%20123&ciudad=Bogotá"
```

### Obtener información:
```bash
curl http://localhost:8080/api/geocodificacion/info
```

---

## 📝 Notas Importantes

1. **API Key:** Debes obtener tu propia API key de LocationIQ y reemplazarla en el código
2. **Límites:** La cuenta gratuita tiene un límite de 10,000 peticiones por día
3. **Caché:** Considera implementar caché para evitar geocodificar la misma dirección múltiples veces
4. **Fallback:** El sistema permite guardar direcciones sin coordenadas si la geocodificación falla
5. **Validación:** Siempre valida que la dirección y ciudad sean proporcionadas antes de llamar al servicio

---

## 🔄 Mejoras Futuras

- [ ] Implementar caché de direcciones geocodificadas
- [ ] Agregar retry logic con backoff exponencial
- [ ] Implementar rate limiting en el backend
- [ ] Agregar soporte para geocodificación inversa (coordenadas → dirección)
- [ ] Crear un servicio de cola para geocodificación batch asíncrona
- [ ] Agregar métricas y logging de uso de la API

---

## 📚 Recursos

- **LocationIQ Docs:** https://locationiq.com/docs
- **API Key Dashboard:** https://my.locationiq.com/dashboard
- **Pricing:** https://locationiq.com/pricing
- **Status Page:** https://status.locationiq.com/
