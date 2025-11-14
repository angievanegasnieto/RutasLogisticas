import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PedidosSimpleService, Pedido } from '../../services/pedidos-simple.service';
import { ClienteService, Cliente, DireccionService, Direccion } from '../../services/cliente.service';
import { LocationService } from '../../core/location.service';
import { MapComponent, MapMarker } from '../../shared/components/map/map.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-mapa-pedidos',
  standalone: true,
  imports: [CommonModule, FormsModule, MapComponent],
  templateUrl: './mapa-pedidos.component.html',
  styleUrls: ['./mapa-pedidos.component.scss']
})
export class MapaPedidosComponent implements OnInit {
  pedidos: Pedido[] = [];
  pedidoSeleccionado?: Pedido;
  clientes: Cliente[] = [];
  direcciones: Direccion[] = [];
  geocodificando: boolean = false;
  mostrarMapa: boolean = false;
  mapMarkers: MapMarker[] = [];
  cargandoPedidos: boolean = false;

  constructor(
    private pedidosService: PedidosSimpleService,
    private clienteService: ClienteService,
    private direccionService: DireccionService,
    private locationService: LocationService
  ) {}

  // Getter para contar pedidos con coordenadas
  get pedidosConCoordenadas(): number {
    return this.pedidos.filter(p => p.latitud && p.longitud).length;
  }

  ngOnInit(): void {
    this.cargarClientes();
    this.cargarDirecciones();
    this.cargarPedidos();
  }

  cargarClientes(): void {
    this.clienteService.getAll().subscribe((data) => {
      this.clientes = data;
    });
  }

  cargarDirecciones(): void {
    this.direccionService.getAll().subscribe((data) => {
      this.direcciones = data;
    });
  }

  cargarPedidos(): void {
    this.cargandoPedidos = true;
    this.pedidosService.getAll().subscribe({
      next: (data) => {
        this.pedidos = data;
        this.cargandoPedidos = false;
        // Mostrar todos los pedidos con coordenadas en el mapa
        this.mostrarTodosPedidosEnMapa();
      },
      error: (error) => {
        console.error('Error al cargar pedidos:', error);
        this.cargandoPedidos = false;
      }
    });
  }

  async onPedidoChange(pedidoId: number): Promise<void> {
    if (!pedidoId) {
      this.pedidoSeleccionado = undefined;
      this.mapMarkers = [];
      this.mostrarMapa = false;
      return;
    }

    const pedido = this.pedidos.find(p => p.id === pedidoId);
    if (!pedido) return;

    this.pedidoSeleccionado = pedido;

    // Si el pedido ya tiene coordenadas, mostrarlas
    if (pedido.latitud && pedido.longitud) {
      this.mostrarPedidoEnMapa(pedido);
      await Swal.fire({
        icon: 'info',
        title: '📍 Pedido con ubicación',
        html: `
          <p>Este pedido ya tiene coordenadas guardadas:</p>
          <p><strong>Lat:</strong> ${pedido.latitud}</p>
          <p><strong>Lon:</strong> ${pedido.longitud}</p>
        `,
        timer: 2500,
        showConfirmButton: false
      });
    } else {
      // Si no tiene coordenadas, intentar geocodificar
      await this.geocodificarPedido(pedido);
    }
  }

  async geocodificarPedido(pedido: Pedido): Promise<void> {
    if (!pedido.direccionId) {
      await Swal.fire({
        icon: 'warning',
        title: 'Sin dirección',
        text: 'Este pedido no tiene una dirección asignada.',
        confirmButtonText: 'Entendido'
      });
      return;
    }

    const direccion = this.direcciones.find(d => d.id === pedido.direccionId);
    if (!direccion) {
      await Swal.fire({
        icon: 'warning',
        title: 'Dirección no encontrada',
        text: 'No se pudo encontrar la información de la dirección.',
        confirmButtonText: 'Entendido'
      });
      return;
    }

    this.geocodificando = true;
    try {
      const direccionCompleta = `${direccion.direccion}, ${direccion.ciudad || 'Santa Cruz'}, Bolivia`;
      
      const resultado = await this.locationService.geocode(direccionCompleta).toPromise();
      
      if (resultado) {
        const lat = parseFloat(resultado.latitude);
        const lon = parseFloat(resultado.longitude);
        
        // Actualizar el pedido en la base de datos
        const pedidoActualizado: Partial<Pedido> = {
          ...pedido,
          latitud: lat,
          longitud: lon
        };

        this.pedidosService.update(pedido.id!, pedidoActualizado).subscribe({
          next: async (pedidoGuardado) => {
            // Actualizar el pedido en la lista local
            const index = this.pedidos.findIndex(p => p.id === pedido.id);
            if (index !== -1) {
              this.pedidos[index] = pedidoGuardado;
            }
            this.pedidoSeleccionado = pedidoGuardado;
            
            this.mostrarPedidoEnMapa(pedidoGuardado);
            
            await Swal.fire({
              icon: 'success',
              title: '✅ Pedido geocodificado',
              html: `
                <p><strong>Ubicación encontrada y guardada:</strong></p>
                <p>${resultado.displayName}</p>
                <p style="margin-top: 10px;">
                  <strong>Coordenadas:</strong><br>
                  Lat: ${lat.toFixed(6)}<br>
                  Lon: ${lon.toFixed(6)}
                </p>
              `,
              timer: 3000,
              showConfirmButton: true
            });
          },
          error: async (error) => {
            console.error('Error al actualizar pedido:', error);
            await Swal.fire({
              icon: 'warning',
              title: 'Coordenadas no guardadas',
              text: 'Se obtuvo la ubicación pero no se pudo guardar en la base de datos.',
              confirmButtonText: 'Entendido'
            });
          }
        });
      }
    } catch (error) {
      console.error('Error al geocodificar:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Error de geocodificación',
        text: 'No se pudo obtener las coordenadas de la dirección. Verifica la dirección o intenta más tarde.',
        confirmButtonText: 'Entendido'
      });
    } finally {
      this.geocodificando = false;
    }
  }

  mostrarPedidoEnMapa(pedido: Pedido): void {
    if (pedido.latitud && pedido.longitud) {
      const lat = typeof pedido.latitud === 'number' ? pedido.latitud : parseFloat(pedido.latitud as any);
      const lon = typeof pedido.longitud === 'number' ? pedido.longitud : parseFloat(pedido.longitud as any);
      
      this.mapMarkers = [{
        id: `pedido-${pedido.id}`,
        lat: lat,
        lng: lon,
        title: `Pedido #${pedido.id}`,
        description: `${pedido.clienteNombre || pedido.cliente || 'Cliente'} - ${pedido.direccionCompleta || pedido.direccion || 'Dirección'}`,
        icon: 'delivery'
      }];
      this.mostrarMapa = true;
    }
  }

  mostrarTodosPedidosEnMapa(): void {
    const markers: MapMarker[] = this.pedidos
      .filter(p => p.latitud && p.longitud)
      .map(p => {
        const lat = typeof p.latitud === 'number' ? p.latitud : parseFloat(p.latitud as any);
        const lon = typeof p.longitud === 'number' ? p.longitud : parseFloat(p.longitud as any);
        
        return {
          id: `pedido-${p.id}`,
          lat: lat,
          lng: lon,
          title: `Pedido #${p.id}`,
          description: `${p.clienteNombre || p.cliente || 'Cliente'} - ${p.direccionCompleta || p.direccion || 'Dirección'}`,
          icon: 'delivery'
        };
      });

    if (markers.length > 0) {
      this.mapMarkers = markers;
      this.mostrarMapa = true;
    }
  }
}
