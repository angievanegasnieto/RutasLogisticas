import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../core/auth.service';
import { MapComponent, MapMarker } from '../../shared/components/map/map.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-rutas',
  standalone: true,
  imports: [CommonModule, MapComponent],
  templateUrl: './rutas.component.html',
  styleUrl: './rutas.component.scss'
})
export class RutasComponent implements OnInit {
  
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  
  rutaOptimizada: any = null;
  mostrarMapa: boolean = false;
  cargando: boolean = false;
  mapMarkers: MapMarker[] = [];
  mapHeight: string = '350px';

  private readonly API_URL = 'http://localhost:8080/api';

  ngOnInit(): void {
    this.cargarMiRuta();
  }

  /**
   * 🗺️ Cargar la ruta optimizada del conductor actual
   */
  cargarMiRuta(): void {
    const user = this.auth.user();
    if (!user || user.role !== 'CONDUCTOR') {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No tienes permisos para ver esta sección',
        confirmButtonColor: '#d33'
      });
      return;
    }

    this.cargando = true;

    Swal.fire({
      title: 'Calculando tu ruta...',
      html: 'Buscando tus entregas asignadas...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    // Obtener el conductorId basado en el userId (igual que en pedidos)
    this.http.get<any[]>(`${this.API_URL}/conductores`).subscribe({
      next: (conductores) => {
        // Buscar el conductor que coincida con el userId del usuario
        const miConductor = conductores.find(c => c.userId === user.id);
        
        if (!miConductor) {
          this.cargando = false;
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se encontró tu perfil de conductor',
            confirmButtonColor: '#d33'
          });
          return;
        }

        // Ahora cargar la ruta con el conductorId
        this.cargarRutaPorConductorId(miConductor.id);
      },
      error: (error) => {
        this.cargando = false;
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Error al cargar tu perfil: ' + (error.error?.message || error.message),
          confirmButtonColor: '#d33'
        });
      }
    });
  }

  /**
   * 🚚 Cargar ruta por ID de conductor
   */
  private cargarRutaPorConductorId(conductorId: number): void {
    this.http.get<any>(`${this.API_URL}/rutas-optimizadas/conductor/${conductorId}`).subscribe({
      next: (response) => {
        this.cargando = false;
        Swal.close();
        
        if (response.exitoso) {
          this.rutaOptimizada = response;
          this.prepararMarcadores();
          this.mostrarMapa = true;

          Swal.fire({
            icon: 'success',
            title: '¡Ruta calculada!',
            html: `
              <div style="text-align: left;">
                <p><strong>Entregas:</strong> ${response.rutaInfo.numeroPedidos}</p>
                <p><strong>Distancia:</strong> ${response.rutaInfo.distanciaTotal} km</p>
                <p><strong>Duración estimada:</strong> ${response.rutaInfo.duracionTotal} min</p>
              </div>
            `,
            confirmButtonColor: '#28a745',
            timer: 3000
          });
        } else {
          Swal.fire({
            icon: 'info',
            title: 'Sin entregas',
            text: response.error || 'No tienes pedidos asignados en este momento',
            confirmButtonColor: '#3085d6'
          });
        }
      },
      error: (error) => {
        this.cargando = false;
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
   * 🗺️ Preparar marcadores para el componente de mapa
   */
  prepararMarcadores(): void {
    this.mapMarkers = [];

    // Marcador de origen
    this.mapMarkers.push({
      id: 'origen',
      lat: this.rutaOptimizada.origen.latitud,
      lng: this.rutaOptimizada.origen.longitud,
      title: '🏢 Punto de Partida',
      description: this.rutaOptimizada.origen.direccion,
      icon: 'start'
    });

    // Marcadores de entregas
    this.rutaOptimizada.puntosEntrega.forEach((punto: any) => {
      this.mapMarkers.push({
        id: `entrega-${punto.pedidoId}`,
        lat: punto.latitud,
        lng: punto.longitud,
        title: `📦 Entrega #${punto.orden} - ${punto.clienteNombre}`,
        description: `${punto.producto} (${punto.cantidad})<br>${punto.direccion}, ${punto.ciudad}<br><span class="badge bg-${this.getBadgeClass(punto.estado)}">${punto.estado}</span>`,
        icon: 'delivery'
      });
    });
  }

  /**
   * 🎨 Clase de badge según estado
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
   * 🔄 Refrescar ruta
   */
  refrescar(): void {
    this.mostrarMapa = false;
    this.rutaOptimizada = null;
    this.cargarMiRuta();
  }

  /**
   * 🖨️ Imprimir ruta
   */
  imprimirRuta(): void {
    window.print();
  }
}
