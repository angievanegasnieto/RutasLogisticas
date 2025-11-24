import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-rutas-conductores',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './rutas-conductores.component.html',
  styleUrl: './rutas-conductores.component.scss'
})
export class RutasConductoresComponent implements OnInit {

  conductores: any[] = [];
  conductorSeleccionado: any = null;
  rutaOptimizada: any = null;
  mostrarMapa: boolean = false;

  private readonly API_URL = 'http://localhost:8080/api';
  private readonly LOCATIONIQ_API_KEY = 'pk.e7110aca548a81884ebf69cfdad9cab6';

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.cargarResumenConductores();
  }

  /**
   * 📋 Cargar resumen de conductores con rutas
   */
  cargarResumenConductores(): void {
    Swal.fire({
      title: 'Cargando conductores...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    this.http.get<any>(`${this.API_URL}/rutas-optimizadas/resumen`).subscribe({
      next: (response) => {
        Swal.close();
        if (response.exitoso) {
          this.conductores = response.conductores;
          
          if (this.conductores.length === 0) {
            Swal.fire({
              icon: 'info',
              title: 'Sin rutas',
              text: 'No hay conductores con pedidos asignados',
              confirmButtonColor: '#3085d6'
            });
          }
        }
      },
      error: (error) => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Error al cargar conductores: ' + (error.error?.error || error.message),
          confirmButtonColor: '#d33'
        });
      }
    });
  }

  /**
   * 🗺️ Ver ruta de un conductor
   */
  verRutaConductor(conductorId: number): void {
    Swal.fire({
      title: 'Calculando ruta óptima...',
      html: 'Optimizando orden de entregas...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    this.http.get<any>(`${this.API_URL}/rutas-optimizadas/conductor/${conductorId}`).subscribe({
      next: (response) => {
        Swal.close();
        
        if (response.exitoso) {
          this.rutaOptimizada = response;
          this.conductorSeleccionado = this.conductores.find(c => c.conductorId === conductorId);
          this.mostrarMapa = true;

          // Inicializar mapa después de que el DOM se actualice
          setTimeout(() => {
            this.inicializarMapa();
          }, 100);

          Swal.fire({
            icon: 'success',
            title: '¡Ruta calculada!',
            html: `
              <div style="text-align: left;">
                <p><strong>Conductor:</strong> ${response.conductorNombre}</p>
                <p><strong>Pedidos:</strong> ${response.rutaInfo.numeroPedidos}</p>
                <p><strong>Distancia:</strong> ${response.rutaInfo.distanciaTotal} km</p>
                <p><strong>Duración estimada:</strong> ${response.rutaInfo.duracionTotal} min</p>
              </div>
            `,
            confirmButtonColor: '#28a745',
            timer: 3000
          });
        }
      },
      error: (error) => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.error?.error || 'Error al calcular la ruta',
          confirmButtonColor: '#d33'
        });
      }
    });
  }

  /**
   * 🗺️ Inicializar mapa con Leaflet y LocationIQ
   */
  inicializarMapa(): void {
    const mapElement = document.getElementById('map');
    if (!mapElement) return;

    // Limpiar mapa anterior si existe
    mapElement.innerHTML = '';

    // @ts-ignore
    const L = (window as any).L;
    if (!L) {
      console.error('Leaflet no está cargado');
      return;
    }

    // Crear mapa centrado en el origen
    const map = L.map('map').setView([this.rutaOptimizada.origen.latitud, this.rutaOptimizada.origen.longitud], 12);

    // Añadir capa de tiles de LocationIQ
    L.tileLayer(`https://tiles.locationiq.com/v3/streets/r/{z}/{x}/{y}.png?key=${this.LOCATIONIQ_API_KEY}`, {
      attribution: '© LocationIQ',
      maxZoom: 18
    }).addTo(map);

    // Icono personalizado para origen
    const origenIcon = L.icon({
      iconUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSIjMDA3YmZmIj48cGF0aCBkPSJNMTIgMkM4LjEzIDIgNSA1LjEzIDUgOWMwIDUuMjUgNyAxMyA3IDEzczctNy43NSA3LTEzYzAtMy44Ny0zLjEzLTctNy03em0wIDkuNWMtMS4zOCAwLTIuNS0xLjEyLTIuNS0yLjVzMS4xMi0yLjUgMi41LTIuNSAyLjUgMS4xMiAyLjUgMi41LTEuMTIgMi41LTIuNSAyLjV6Ii8+PC9zdmc+',
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32]
    });

    // Icono personalizado para entregas
    const entregaIcon = L.icon({
      iconUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSIjZGMyNjI2Ij48cGF0aCBkPSJNMTIgMkM4LjEzIDIgNSA1LjEzIDUgOWMwIDUuMjUgNyAxMyA3IDEzczctNy43NSA3LTEzYzAtMy44Ny0zLjEzLTctNy03em0wIDkuNWMtMS4zOCAwLTIuNS0xLjEyLTIuNS0yLjVzMS4xMi0yLjUgMi41LTIuNSAyLjUgMS4xMiAyLjUgMi41LTEuMTIgMi41LTIuNSAyLjV6Ii8+PC9zdmc+',
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32]
    });

    // Marcador de origen
    L.marker([this.rutaOptimizada.origen.latitud, this.rutaOptimizada.origen.longitud], { icon: origenIcon })
      .addTo(map)
      .bindPopup(`<strong>🏢 ORIGEN</strong><br>${this.rutaOptimizada.origen.direccion}`);

    // Marcadores de puntos de entrega
    const coordenadas: [number, number][] = [[this.rutaOptimizada.origen.latitud, this.rutaOptimizada.origen.longitud]];

    this.rutaOptimizada.puntosEntrega.forEach((punto: any) => {
      const marker = L.marker([punto.latitud, punto.longitud], { icon: entregaIcon })
        .addTo(map)
        .bindPopup(`
          <div style="min-width: 200px;">
            <strong>📦 Entrega #${punto.orden}</strong><br>
            <strong>Cliente:</strong> ${punto.clienteNombre}<br>
            <strong>Producto:</strong> ${punto.producto} (${punto.cantidad})<br>
            <strong>Dirección:</strong> ${punto.direccion}<br>
            <strong>Ciudad:</strong> ${punto.ciudad}<br>
            <span class="badge badge-${this.getBadgeClass(punto.estado)}">${punto.estado}</span>
          </div>
        `);

      // Añadir etiqueta con número de orden
      const divIcon = L.divIcon({
        className: 'numero-entrega',
        html: `<div style="background: white; border: 2px solid #dc2626; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 12px;">${punto.orden}</div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      L.marker([punto.latitud, punto.longitud], { icon: divIcon }).addTo(map);

      coordenadas.push([punto.latitud, punto.longitud]);
    });

    // Dibujar línea de ruta
    const polyline = L.polyline(coordenadas, {
      color: '#3b82f6',
      weight: 4,
      opacity: 0.7,
      dashArray: '10, 5'
    }).addTo(map);

    // Ajustar zoom para mostrar toda la ruta
    map.fitBounds(polyline.getBounds(), { padding: [50, 50] });
  }

  /**
   * 🎨 Obtener clase de badge según estado
   */
  getBadgeClass(estado: string): string {
    switch (estado) {
      case 'PENDIENTE': return 'warning';
      case 'ASIGNADO': return 'info';
      case 'EN_RUTA': return 'primary';
      case 'ENTREGADO': return 'success';
      case 'FALLIDO': return 'danger';
      case 'REINTENTO': return 'secondary';
      default: return 'secondary';
    }
  }

  /**
   * 🔙 Volver a la lista
   */
  volverALista(): void {
    this.mostrarMapa = false;
    this.rutaOptimizada = null;
    this.conductorSeleccionado = null;
  }

  /**
   * 🔄 Refrescar datos
   */
  refrescar(): void {
    this.cargarResumenConductores();
  }

  /**
   * 📄 Exportar reporte de ruta
   */
  exportarReporte(): void {
    if (!this.rutaOptimizada) return;

    const reporte = {
      conductor: this.rutaOptimizada.conductorNombre,
      fecha: new Date().toLocaleString('es-CO'),
      origen: this.rutaOptimizada.origen.direccion,
      distanciaTotal: this.rutaOptimizada.rutaInfo.distanciaTotal + ' km',
      duracionEstimada: this.rutaOptimizada.rutaInfo.duracionTotal + ' min',
      numeroPedidos: this.rutaOptimizada.rutaInfo.numeroPedidos,
      entregas: this.rutaOptimizada.puntosEntrega.map((p: any) => ({
        orden: p.orden,
        cliente: p.clienteNombre,
        producto: p.producto,
        cantidad: p.cantidad,
        direccion: p.direccion,
        ciudad: p.ciudad,
        coordenadas: `${p.latitud}, ${p.longitud}`,
        estado: p.estado
      }))
    };

    const dataStr = JSON.stringify(reporte, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ruta_${this.rutaOptimizada.conductorNombre}_${new Date().getTime()}.json`;
    link.click();

    Swal.fire({
      icon: 'success',
      title: 'Reporte exportado',
      text: 'El archivo se ha descargado correctamente',
      timer: 2000,
      showConfirmButton: false
    });
  }

  /**
   * 🖨️ Imprimir ruta
   */
  imprimirRuta(): void {
    window.print();
  }
}
