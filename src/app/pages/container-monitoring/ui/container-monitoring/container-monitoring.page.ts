import {Component, NgZone, OnInit} from '@angular/core';
import {LeafletDirective} from '@bluehalo/ngx-leaflet';
import * as L from 'leaflet';

interface Container {
  id: string;
  numeroContenedor: string;
  lat: number;
  lng: number;
  estado: 'EN_TRANSITO' | 'DETENIDO' | 'EN_PUERTO' | 'ENTREGADO';
  destino: string;
  eta: string;
  temperatura?: number;
}

@Component({
  selector: 'app-container-monitoring',
  imports: [LeafletDirective],
  templateUrl: './container-monitoring.page.html',
  styleUrl: './container-monitoring.page.css'
})
export class ContainerMonitoringPage implements OnInit {
  // Configuración del mapa
  options: L.MapOptions = {
    layers: [
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '© OpenStreetMap contributors'
      })
    ],
    zoom: 5,
    center: L.latLng(-12.0464, -77.0428) // Lima, Perú
  };

  map!: L.Map;
  markers: Map<string, L.Marker> = new Map();

  // Datos de ejemplo de contenedores
  containers: Container[] = [
    {
      id: '1',
      numeroContenedor: 'CONT-001',
      lat: -12.0464,
      lng: -77.0428,
      estado: 'EN_TRANSITO',
      destino: 'Callao',
      eta: '2025-10-15 14:30',
      temperatura: 18
    },
    {
      id: '2',
      numeroContenedor: 'CONT-002',
      lat: -12.1200,
      lng: -77.0300,
      estado: 'DETENIDO',
      destino: 'Lima Centro',
      eta: '2025-10-15 16:00',
      temperatura: 22
    },
    {
      id: '3',
      numeroContenedor: 'CONT-003',
      lat: -11.9500,
      lng: -77.1000,
      estado: 'EN_PUERTO',
      destino: 'Puerto',
      eta: '2025-10-15 18:00',
      temperatura: 20
    }
  ];

  constructor(private zone: NgZone) {}

  ngOnInit() {
    // Aquí puedes cargar datos desde tu backend
    // this.loadContainersFromBackend();
  }

  // Evento cuando el mapa está listo
  onMapReady(map: L.Map) {
    this.map = map;
    this.addAllContainerMarkers();

    // Ajustar vista para mostrar todos los marcadores
    this.fitMapToMarkers();
  }

  // Crear icono personalizado según estado
  private createCustomIcon(estado: Container['estado']): L.Icon {
    const iconConfig = {
      'EN_TRANSITO': {
        url: 'assets/icons/container-moving.png',
        className: 'marker-en-transito'
      },
      'DETENIDO': {
        url: 'assets/icons/container-stopped.png',
        className: 'marker-detenido'
      },
      'EN_PUERTO': {
        url: 'assets/icons/container-port.png',
        className: 'marker-puerto'
      },
      'ENTREGADO': {
        url: 'assets/icons/container-delivered.png',
        className: 'marker-entregado'
      }
    };

    const config = iconConfig[estado];

    return L.icon({
      iconUrl: config.url,
      iconSize: [40, 40],
      iconAnchor: [20, 40],
      popupAnchor: [0, -40],
      shadowUrl: 'assets/marker-shadow.png',
      shadowSize: [41, 41],
      className: config.className
    });
  }

  // Crear DivIcon personalizado (alternativa más flexible)
  private createCustomDivIcon(container: Container): L.DivIcon {
    const estadoColors = {
      'EN_TRANSITO': '#3498db',
      'DETENIDO': '#e74c3c',
      'EN_PUERTO': '#f39c12',
      'ENTREGADO': '#27ae60'
    };

    const html = `
      <div class="custom-marker ${container.estado.toLowerCase()}">
        <div class="marker-icon">
          <img src="assets/images/smart-trash.png" alt="Container" />
        </div>
        <div class="marker-badge" style="background: ${estadoColors[container.estado]}">
          ${container.numeroContenedor}
        </div>
        ${container.estado === 'EN_TRANSITO' ? '<div class="marker-pulse"></div>' : ''}
      </div>
    `;

    return L.divIcon({
      html: html,
      className: 'custom-container-marker',
      iconSize: [60, 70],
      iconAnchor: [30, 70],
      popupAnchor: [0, -70]
    });
  }

  // Crear contenido del popup
  private createPopupContent(container: Container): string {
    const estadoLabels = {
      'EN_TRANSITO': 'En Tránsito',
      'DETENIDO': 'Detenido',
      'EN_PUERTO': 'En Puerto',
      'ENTREGADO': 'Entregado'
    };

    return `
      <div class="container-popup">
        <h3>${container.numeroContenedor}</h3>
        <div class="popup-content">
          <p>
            <strong>Estado:</strong>
            <span class="badge ${container.estado.toLowerCase()}">
              ${estadoLabels[container.estado]}
            </span>
          </p>
          <p><strong>Destino:</strong> ${container.destino}</p>
          <p><strong>ETA:</strong> ${container.eta}</p>
          ${container.temperatura ? `<p><strong>Temperatura:</strong> ${container.temperatura}°C</p>` : ''}
        </div>
        <button class="details-btn" onclick="window.verDetalles('${container.id}')">
          Ver Detalles Completos
        </button>
      </div>
    `;
  }

  // Agregar todos los marcadores
  private addAllContainerMarkers() {
    this.containers.forEach(container => {
      this.addContainerMarker(container);
    });
  }

  // Agregar un marcador individual
  addContainerMarker(container: Container) {
    // Opción 1: Usar icono personalizado con imagen
    // const icon = this.createCustomIcon(container.estado);

    // Opción 2: Usar DivIcon con HTML/CSS (más flexible)
    const icon = this.createCustomDivIcon(container);

    const marker = L.marker([container.lat, container.lng], { icon })
      .bindPopup(this.createPopupContent(container), {
        maxWidth: 300,
        className: 'custom-popup'
      })
      .bindTooltip(
        `<b>${container.numeroContenedor}</b><br>${container.estado}`,
        {
          permanent: false,
          direction: 'top',
          offset: [0, -40]
        }
      );

    // Eventos del marcador
    marker.on('click', () => {
      this.zone.run(() => {
        console.log('Contenedor seleccionado:', container);
        // Aquí puedes emitir eventos o actualizar el estado
      });
    });

    marker.addTo(this.map);
    this.markers.set(container.id, marker);
  }

  // Actualizar estado de un contenedor en tiempo real
  updateContainer(containerId: string, updates: Partial<Container>) {
    const container = this.containers.find(c => c.id === containerId);
    if (!container) return;

    // Actualizar datos del contenedor
    Object.assign(container, updates);

    // Obtener el marcador existente
    const marker = this.markers.get(containerId);
    if (!marker) return;

    // Actualizar icono si cambió el estado
    if (updates.estado) {
      const newIcon = this.createCustomDivIcon(container);
      marker.setIcon(newIcon);
    }

    // Actualizar posición si cambió
    if (updates.lat && updates.lng) {
      // Animar el movimiento
      this.animateMarkerToPosition(marker, [updates.lat, updates.lng], 2000);
    }

    // Actualizar popup
    marker.setPopupContent(this.createPopupContent(container));
  }

  // Animar movimiento del marcador
  private animateMarkerToPosition(
    marker: L.Marker,
    newPos: [number, number],
    duration: number
  ) {
    const startPos = marker.getLatLng();
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Interpolación lineal
      const lat = startPos.lat + (newPos[0] - startPos.lat) * progress;
      const lng = startPos.lng + (newPos[1] - startPos.lng) * progress;

      marker.setLatLng([lat, lng]);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    animate();
  }

  // Ajustar el mapa para mostrar todos los marcadores
  private fitMapToMarkers() {
    if (this.markers.size === 0) return;

    const group = L.featureGroup(Array.from(this.markers.values()));
    this.map.fitBounds(group.getBounds(), { padding: [50, 50] });
  }

  // Simular actualización en tiempo real (para testing)
  simulateRealTimeUpdate() {
    setInterval(() => {
      const randomContainer = this.containers[
        Math.floor(Math.random() * this.containers.length)
        ];

      // Mover ligeramente la posición
      this.updateContainer(randomContainer.id, {
        lat: randomContainer.lat + (Math.random() - 0.5) * 0.01,
        lng: randomContainer.lng + (Math.random() - 0.5) * 0.01
      });
    }, 5000);
  }
}

// Función global para el botón "Ver Detalles"
(window as any).verDetalles = (containerId: string) => {
  console.log('Ver detalles del contenedor:', containerId);
  // Aquí puedes abrir un modal o navegar a otra página
};
