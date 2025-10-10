import { Component, NgZone, OnInit, inject, computed } from '@angular/core';
import { LeafletDirective } from '@bluehalo/ngx-leaflet';
import * as L from 'leaflet';
import { ContainerMonitoringStore } from '../../model/store/container-monitoring.store';
import { ContainerEntity, ContainerStatusEnum, ContainerTypeEnum } from '../../../../../entities';

@Component({
  selector: 'app-container-monitoring',
  imports: [LeafletDirective],
  templateUrl: './container-monitoring.page.html',
  styleUrl: './container-monitoring.page.css'
})
export class ContainerMonitoringPage implements OnInit {
  readonly store = inject(ContainerMonitoringStore);
  private zone = inject(NgZone);

  filtersPanelOpen = false;

  // Configuración del mapa usando datos del store
  options = computed<L.MapOptions>(() => ({
    layers: [
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '© OpenStreetMap contributors'
      })
    ],
    zoom: this.store.mapZoom(),
    center: L.latLng(this.store.mapCenter().lat, this.store.mapCenter().lng)
  }));

  map!: L.Map;
  markers: Map<string, L.Marker> = new Map();

  // Computed properties desde el store
  containers = computed(() => this.store.filteredContainers());
  isLoading = computed(() => this.store.isLoading());
  error = computed(() => this.store.error());
  selectedContainer = computed(() => this.store.selectedContainer());
  hasValidContainers = computed(() => this.store.hasValidContainers());

  // Estadísticas rápidas
  quickStats = computed(() => this.store.getQuickStats());

  constructor() {}

  ngOnInit() {
    this.loadContainers().then(() => {});
  }

  /**
   * Cargar containers desde el servicio
   */
  async loadContainers(): Promise<void> {
    await this.store.loadContainers();
  }

  // Evento cuando el mapa está listo
  onMapReady(map: L.Map) {
    this.map = map;

    // Agregar marcadores cuando haya containers válidos
    this.addAllContainerMarkers();

    // Ajustar vista para mostrar todos los marcadores si hay containers válidos
    if (this.hasValidContainers()) {
      this.fitMapToMarkers();
    }
  }

  // Crear icono personalizado según estado
  private createCustomIcon(status: ContainerStatusEnum): L.Icon {
    const iconConfig = {
      [ContainerStatusEnum.ACTIVE]: {
        url: 'assets/icons/container-active.png',
        className: 'marker-active'
      },
      [ContainerStatusEnum.MAINTENANCE]: {
        url: 'assets/icons/container-maintenance.png',
        className: 'marker-maintenance'
      },
      [ContainerStatusEnum.DECOMMISSIONED]: {
        url: 'assets/icons/container-decommissioned.png',
        className: 'marker-decommissioned'
      }
    };

    const config = iconConfig[status];

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
  private createCustomDivIcon(container: ContainerEntity): L.DivIcon {
    const statusColors = {
      [ContainerStatusEnum.ACTIVE]: '#27ae60',
      [ContainerStatusEnum.MAINTENANCE]: '#f39c12',
      [ContainerStatusEnum.DECOMMISSIONED]: '#e74c3c'
    };

    const typeIcons = {
      [ContainerTypeEnum.ORGANIC]: '🌱',
      [ContainerTypeEnum.RECYCLABLE]: '♻️',
      [ContainerTypeEnum.GENERAL]: '🗑️'
    };

    const html = `
      <div class="custom-marker ${container.status.toLowerCase()}">
        <div class="marker-icon">
          <span class="type-icon">${typeIcons[container.containerType]}</span>
        </div>
        <div class="marker-badge" style="background: ${statusColors[container.status]}">
          ${container.id.substring(0, 8)}
        </div>
        ${container.status === ContainerStatusEnum.ACTIVE && container.currentFillLevel > 80 ?
          '<div class="marker-pulse warning"></div>' : ''}
        ${container.status === ContainerStatusEnum.MAINTENANCE ?
          '<div class="marker-pulse maintenance"></div>' : ''}
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
  private createPopupContent(container: ContainerEntity): string {
    const statusLabels = {
      [ContainerStatusEnum.ACTIVE]: 'Activo',
      [ContainerStatusEnum.MAINTENANCE]: 'Mantenimiento',
      [ContainerStatusEnum.DECOMMISSIONED]: 'Fuera de Servicio'
    };

    const typeLabels = {
      [ContainerTypeEnum.ORGANIC]: 'Orgánico',
      [ContainerTypeEnum.RECYCLABLE]: 'Reciclable',
      [ContainerTypeEnum.GENERAL]: 'General'
    };

    const formatDate = (date: Date | null) => {
      if (!date) return 'No disponible';
      return new Intl.DateTimeFormat('es-PE', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    };

    return `
      <div class="container-popup">
        <h3>Contenedor ${container.id.substring(0, 8)}</h3>
        <div class="popup-content">
          <p>
            <strong>Estado:</strong>
            <span class="badge ${container.status.toLowerCase()}">
              ${statusLabels[container.status]}
            </span>
          </p>
          <p><strong>Tipo:</strong> ${typeLabels[container.containerType]}</p>
          <p><strong>Dirección:</strong> ${container.address}</p>
          <p><strong>Distrito:</strong> ${container.districtCode}</p>
          <p><strong>Capacidad:</strong> ${container.volumeLiters}L / ${container.maxWeightKg}kg</p>
          <p><strong>Llenado:</strong> ${container.currentFillLevel}%</p>
          ${container.lastReadingTimestamp ?
            `<p><strong>Última lectura:</strong> ${formatDate(container.lastReadingTimestamp)}</p>` : ''}
          ${container.lastCollectionDate ?
            `<p><strong>Última recolección:</strong> ${formatDate(container.lastCollectionDate)}</p>` : ''}
          <p><strong>Frecuencia:</strong> Cada ${container.collectionFrequencyDays} días</p>
        </div>
        <button class="details-btn" onclick="window.verDetalles('${container.id}')">
          Ver Detalles Completos
        </button>
      </div>
    `;
  }

  // Agregar todos los marcadores
  private addAllContainerMarkers() {
    this.containers().forEach(container => {
      this.addContainerMarker(container);
    });
  }

  // Agregar un marcador individual
  addContainerMarker(container: ContainerEntity) {
    // Verificar que el container tenga coordenadas válidas
    const lat = parseFloat(container.latitude);
    const lng = parseFloat(container.longitude);

    if (isNaN(lat) || isNaN(lng)) {
      console.warn(`Container ${container.id} tiene coordenadas inválidas: ${container.latitude}, ${container.longitude}`);
      return;
    }

    // Usar DivIcon con HTML/CSS (más flexible)
    const icon = this.createCustomDivIcon(container);

    const marker = L.marker([lat, lng], { icon })
      .bindPopup(this.createPopupContent(container), {
        maxWidth: 300,
        className: 'custom-popup'
      })
      .bindTooltip(
        `<b>Contenedor ${container.id.substring(0, 8)}</b><br>${container.address}`,
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
        this.store.selectContainer(container);
      });
    });

    marker.addTo(this.map);
    this.markers.set(container.id, marker);
  }

  // Actualizar estado de un contenedor en tiempo real
  updateContainer(containerId: string, updates: Partial<ContainerEntity>) {
    // Usar el store para actualizar
    this.store.updateContainer(containerId, updates);

    const container = this.store.getContainerById(containerId);
    if (!container) return;

    // Obtener el marcador existente
    const marker = this.markers.get(containerId);
    if (!marker) return;

    // Actualizar icono si cambió el estado o tipo
    if (updates.status || updates.containerType) {
      const newIcon = this.createCustomDivIcon(container);
      marker.setIcon(newIcon);
    }

    // Actualizar posición si cambiaron las coordenadas
    if (updates.latitude || updates.longitude) {
      const lat = parseFloat(container.latitude);
      const lng = parseFloat(container.longitude);

      if (!isNaN(lat) && !isNaN(lng)) {
        // Animar el movimiento
        this.animateMarkerToPosition(marker, [lat, lng], 2000);
      }
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
      const containers = this.containers();
      if (containers.length === 0) return;

      const randomContainer = containers[
        Math.floor(Math.random() * containers.length)
      ];

      // Actualizar nivel de llenado o estado
      const updates: Partial<ContainerEntity> = {};

      if (Math.random() > 0.5) {
        // Actualizar nivel de llenado
        updates.currentFillLevel = Math.floor(Math.random() * 100);
      } else {
        // Cambiar estado aleatoriamente
        const statuses = Object.values(ContainerStatusEnum);
        updates.status = statuses[Math.floor(Math.random() * statuses.length)];
      }

      this.updateContainer(randomContainer.id, updates);
    }, 5000);
  }
}

// Función global para el botón "Ver Detalles"
(window as any).verDetalles = (containerId: string) => {
  console.log('Ver detalles del contenedor:', containerId);
  // Aquí puedes abrir un modal o navegar a otra página
};
