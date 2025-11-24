import { Component, OnInit, OnDestroy, Input, Output, EventEmitter, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';

export interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  title: string;
  description?: string;
  icon?: 'default' | 'start' | 'end' | 'delivery' | 'current';
}

export interface RoutePolyline {
  coordinates: [number, number][];
  color?: string;
  weight?: number;
}

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [id]="mapId" class="map-container" [style.height]="height"></div>
  `,
  styles: [`
    .map-container {
      width: 100%;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
    
    :host ::ng-deep .leaflet-popup-content-wrapper {
      border-radius: 8px;
    }
    
    :host ::ng-deep .leaflet-popup-content {
      margin: 10px;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }
  `]
})
export class MapComponent implements OnInit, OnDestroy {
  @Input() height: string = '500px';
  @Input() center: [number, number] = [-17.7833, -63.1821]; // Santa Cruz, Bolivia por defecto
  @Input() zoom: number = 13;
  @Input() markers: MapMarker[] = [];
  @Input() route?: RoutePolyline;
  @Input() autoFitBounds: boolean = true;
  
  @Output() markerClick = new EventEmitter<MapMarker>();
  @Output() mapClick = new EventEmitter<L.LeafletMouseEvent>();

  mapId = `map-${Math.random().toString(36).substr(2, 9)}`;
  private map?: L.Map;
  private markerLayers: Map<string, L.Marker> = new Map();
  private routeLayer?: L.Polyline;

  private iconCache: Map<string, L.Icon> = new Map();

  constructor() {
    // Effect para actualizar marcadores cuando cambien
    effect(() => {
      if (this.map) {
        this.updateMarkers(this.markers);
      }
    });

    // Effect para actualizar ruta cuando cambie
    effect(() => {
      if (this.map && this.route) {
        this.updateRoute(this.route);
      }
    });
  }

  ngOnInit(): void {
    setTimeout(() => this.initMap(), 100);
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
  }

  private initMap(): void {
    this.map = L.map(this.mapId).setView(this.center, this.zoom);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(this.map);

    this.map.on('click', (e: L.LeafletMouseEvent) => {
      this.mapClick.emit(e);
    });

    // Cargar marcadores y ruta inicial
    this.updateMarkers(this.markers);
    if (this.route) {
      this.updateRoute(this.route);
    }
  }

  private getIcon(type: string): L.Icon {
    if (this.iconCache.has(type)) {
      return this.iconCache.get(type)!;
    }

    const iconConfig: Record<string, { iconUrl: string; iconSize: [number, number]; iconAnchor: [number, number]; popupAnchor: [number, number] }> = {
      default: {
        iconUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNSIgaGVpZ2h0PSI0MSIgdmlld0JveD0iMCAwIDI1IDQxIj48cGF0aCBmaWxsPSIjMDA3OGZmIiBkPSJNMTIuNSAwQzUuNiAwIDAgNS42IDAgMTIuNWMwIDcuOSAxMi41IDI4LjUgMTIuNSAyOC41czEyLjUtMjAuNiAxMi41LTI4LjVDMjUgNS42IDE5LjQgMCAxMi41IDB6bTAgMTcuNWMtMi44IDAtNS0yLjItNS01czIuMi01IDUtNSA1IDIuMiA1IDUtMi4yIDUtNSA1eiIvPjwvc3ZnPg==',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34]
      },
      start: {
        iconUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNSIgaGVpZ2h0PSI0MSIgdmlld0JveD0iMCAwIDI1IDQxIj48cGF0aCBmaWxsPSIjMjJjNTVlIiBkPSJNMTIuNSAwQzUuNiAwIDAgNS42IDAgMTIuNWMwIDcuOSAxMi41IDI4LjUgMTIuNSAyOC41czEyLjUtMjAuNiAxMi41LTI4LjVDMjUgNS42IDE5LjQgMCAxMi41IDB6bTAgMTcuNWMtMi44IDAtNS0yLjItNS01czIuMi01IDUtNSA1IDIuMiA1IDUtMi4yIDUtNSA1eiIvPjwvc3ZnPg==',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34]
      },
      end: {
        iconUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNSIgaGVpZ2h0PSI0MSIgdmlld0JveD0iMCAwIDI1IDQxIj48cGF0aCBmaWxsPSIjZGMyNjI2IiBkPSJNMTIuNSAwQzUuNiAwIDAgNS42IDAgMTIuNWMwIDcuOSAxMi41IDI4LjUgMTIuNSAyOC41czEyLjUtMjAuNiAxMi41LTI4LjVDMjUgNS42IDE5LjQgMCAxMi41IDB6bTAgMTcuNWMtMi44IDAtNS0yLjItNS01czIuMi01IDUtNSA1IDIuMiA1IDUtMi4yIDUtNSA1eiIvPjwvc3ZnPg==',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34]
      },
      delivery: {
        iconUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNSIgaGVpZ2h0PSI0MSIgdmlld0JveD0iMCAwIDI1IDQxIj48cGF0aCBmaWxsPSIjZmY5NTAwIiBkPSJNMTIuNSAwQzUuNiAwIDAgNS42IDAgMTIuNWMwIDcuOSAxMi41IDI4LjUgMTIuNSAyOC41czEyLjUtMjAuNiAxMi41LTI4LjVDMjUgNS42IDE5LjQgMCAxMi41IDB6bTAgMTcuNWMtMi44IDAtNS0yLjItNS01czIuMi01IDUtNSA1IDIuMiA1IDUtMi4yIDUtNSA1eiIvPjwvc3ZnPg==',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34]
      },
      current: {
        iconUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMCIgaGVpZ2h0PSIzMCIgdmlld0JveD0iMCAwIDMwIDMwIj48Y2lyY2xlIGN4PSIxNSIgY3k9IjE1IiByPSIxMiIgZmlsbD0iIzQyODVmNCIgb3BhY2l0eT0iMC4zIi8+PGNpcmNsZSBjeD0iMTUiIGN5PSIxNSIgcj0iOCIgZmlsbD0iIzQyODVmNCIvPjxjaXJjbGUgY3g9IjE1IiBjeT0iMTUiIHI9IjQiIGZpbGw9IndoaXRlIi8+PC9zdmc+',
        iconSize: [30, 30],
        iconAnchor: [15, 15],
        popupAnchor: [0, -15]
      }
    };

    const config = iconConfig[type] || iconConfig.default;
    const icon = L.icon(config);
    this.iconCache.set(type, icon);
    return icon;
  }

  private updateMarkers(markers: MapMarker[]): void {
    if (!this.map) return;

    // Remover marcadores que ya no existen
    const currentIds = new Set(markers.map(m => m.id));
    this.markerLayers.forEach((marker, id) => {
      if (!currentIds.has(id)) {
        this.map!.removeLayer(marker);
        this.markerLayers.delete(id);
      }
    });

    // Agregar o actualizar marcadores
    markers.forEach(markerData => {
      let marker = this.markerLayers.get(markerData.id);
      
      if (marker) {
        // Actualizar posición si cambió
        marker.setLatLng([markerData.lat, markerData.lng]);
      } else {
        // Crear nuevo marcador
        const icon = this.getIcon(markerData.icon || 'default');
        marker = L.marker([markerData.lat, markerData.lng], { icon })
          .addTo(this.map!);
        
        marker.on('click', () => {
          this.markerClick.emit(markerData);
        });

        this.markerLayers.set(markerData.id, marker);
      }

      // Actualizar popup
      const popupContent = `
        <div>
          <h4 style="margin: 0 0 8px 0; color: #333;">${markerData.title}</h4>
          ${markerData.description ? `<p style="margin: 0; color: #666; font-size: 0.9em;">${markerData.description}</p>` : ''}
        </div>
      `;
      marker.bindPopup(popupContent);
    });

    // Ajustar vista si es necesario
    if (this.autoFitBounds && markers.length > 0) {
      const bounds = L.latLngBounds(markers.map(m => [m.lat, m.lng]));
      this.map.fitBounds(bounds, { padding: [50, 50] });
    }
  }

  private updateRoute(route: RoutePolyline): void {
    if (!this.map) return;

    // Remover ruta anterior
    if (this.routeLayer) {
      this.map.removeLayer(this.routeLayer);
    }

    // Agregar nueva ruta
    this.routeLayer = L.polyline(route.coordinates, {
      color: route.color || '#007bff',
      weight: route.weight || 4,
      opacity: 0.7
    }).addTo(this.map);

    // Ajustar vista si es necesario
    if (this.autoFitBounds && route.coordinates.length > 0) {
      this.map.fitBounds(this.routeLayer.getBounds(), { padding: [50, 50] });
    }
  }

  // Métodos públicos para control externo
  public setView(center: [number, number], zoom: number): void {
    this.map?.setView(center, zoom);
  }

  public fitBounds(markers: MapMarker[]): void {
    if (!this.map || markers.length === 0) return;
    const bounds = L.latLngBounds(markers.map(m => [m.lat, m.lng]));
    this.map.fitBounds(bounds, { padding: [50, 50] });
  }

  public clearRoute(): void {
    if (this.routeLayer) {
      this.map?.removeLayer(this.routeLayer);
      this.routeLayer = undefined;
    }
  }

  public clearMarkers(): void {
    this.markerLayers.forEach(marker => {
      this.map?.removeLayer(marker);
    });
    this.markerLayers.clear();
  }
}
