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
        maxZoom: 25,
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
    // Colores por estado (sin cambios)
    const statusConfig = {
      [ContainerStatusEnum.ACTIVE]: {
        color: '#16a34a',      // green-600
        bgColor: '#f0fdf4',    // green-50
        icon: 'pi-check-circle',
        label: 'Activo'
      },
      [ContainerStatusEnum.MAINTENANCE]: {
        color: '#ea580c',      // orange-600
        bgColor: '#fff7ed',    // orange-50
        icon: 'pi-wrench',
        label: 'Mantenimiento'
      },
      [ContainerStatusEnum.DECOMMISSIONED]: {
        color: '#dc2626',      // red-600
        bgColor: '#fef2f2',    // red-50
        icon: 'pi-times-circle',
        label: 'Fuera de Servicio'
      }
    };
    // Iconos por tipo (sin cambios)
    const typeConfig = {
      [ContainerTypeEnum.ORGANIC]: {
        icon: 'pi-sun',
        color: '#84cc16',  // lime-500
        label: 'Orgánico'
      },
      [ContainerTypeEnum.RECYCLABLE]: {
        icon: 'pi-sync',
        color: '#06b6d4',  // cyan-500
        label: 'Reciclable'
      },
      [ContainerTypeEnum.GENERAL]: {
        icon: 'pi-trash',
        color: '#6b7280',  // gray-500
        label: 'General'
      }
    };

    const status = statusConfig[container.status];
    const type = typeConfig[container.containerType];
    const fillLevel = container.currentFillLevel;
    const isHigh = fillLevel > 80;

    // HTML con todos los estilos aplicados inline
    const html = `
    <div style="position: relative; display: flex; align-items: center; justify-content: center;">
      ${isHigh || container.status === ContainerStatusEnum.MAINTENANCE ? `
        <div style="position: absolute; width: 100%; height: 100%; border-radius: 50%; opacity: 0.6; animation: pulse-ring 2s cubic-bezier(0.215, 0.61, 0.355, 1) infinite; background-color: ${status.color};"></div>
      ` : ''}

      <div style="background-color: ${status.bgColor}; border: 3px solid ${status.color}; border-radius: 12px; padding: 8px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15); transition: all 0.3s ease; position: relative; z-index: 1;">
        <div style="position: relative; width: 50px; height: 50px; display: flex; align-items: center; justify-content: center; margin-bottom: 6px;">
          <img src="assets/images/smart-trash.png" alt="Container" style="width: 100%; height: 100%; object-fit: contain; filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));">

          <div style="position: absolute; top: -4px; right: -4px; width: 18px; height: 18px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2); border: 2px solid white; background-color: ${type.color};">
            <i class="pi ${type.icon}" style="font-size: 10px; color: white;"></i>
          </div>

          <div style="position: absolute; bottom: -4px; right: -4px; width: 18px; height: 18px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2); border: 2px solid white; background-color: ${status.color};">
            <i class="pi ${status.icon}" style="font-size: 10px; color: white;"></i>
          </div>
        </div>

        <div style="text-align: center; padding-top: 4px; border-top: 1px solid #e5e7eb;">
          <div style="font-size: 11px; font-weight: 700; color: #1f2937; margin-bottom: 2px;">${container.id.substring(0, 8)}</div>
          <div style="font-size: 10px; font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 3px; color: ${isHigh ? '#dc2626' : '#6b7280'};">
            <i class="pi pi-chart-bar" style="font-size: 10px;"></i>
            <span>${fillLevel}%</span>
          </div>
        </div>
      </div>
    </div>
  `;

    return L.divIcon({
      html: html,
      className: 'custom-container-marker', // Esta clase sigue siendo útil para seleccionar los marcadores si es necesario
      iconSize: [80, 100],
      iconAnchor: [40, 100],
      popupAnchor: [0, -100]
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
