import {Component, computed, inject, OnInit, signal, ViewChild} from '@angular/core';
import {ContainerMonitoringStore} from '../../model/store/container-monitoring.store';
import {ContainerEntity, ContainerStatusEnum, ContainerTypeEnum} from '../../../../entities';
import {GoogleMap, MapAdvancedMarker, MapInfoWindow} from '@angular/google-maps';
import {environment} from '../../../../environments/environment.development';
import {CommonModule} from '@angular/common';


@Component({
  selector: 'app-container-monitoring',
  standalone: true,
  imports: [CommonModule, GoogleMap, MapAdvancedMarker, MapInfoWindow],
  templateUrl: './container-monitoring.page.html',
  styleUrl: './container-monitoring.page.css'
})
export class ContainerMonitoringPage implements OnInit {
  readonly store = inject(ContainerMonitoringStore);

  // Referencia al InfoWindow
  @ViewChild(MapInfoWindow) infoWindow!: MapInfoWindow;

  // Estado UI
  infoWindowContent = signal<ContainerEntity | null>(null);
  filtersPanelOpen = false;

  // Opciones del mapa
  mapOptions: google.maps.MapOptions = {
    mapId: environment.googleMaps.mapIds.depot,
    disableDefaultUI: false,
    clickableIcons: false,
    streetViewControl: false,
    fullscreenControl: false
  };

  // Datos reactivos del store para el mapa
  center = computed<google.maps.LatLngLiteral>(() => ({
    lat: this.store.mapCenter().lat,
    lng: this.store.mapCenter().lng
  }));

  // Datos reactivos
  zoom = computed(() => this.store.mapZoom());
  containers = computed(() => this.store.filteredContainers());
  isLoading = computed(() => this.store.isLoading());
  error = computed(() => this.store.error());
  selectedContainer = computed(() => this.store.selectedContainer());
  hasValidContainers = computed(() => this.store.hasValidContainers());

  // Estadísticas rápidas
  quickStats = computed(() => this.store.getQuickStats());

  async ngOnInit() {
    await this.loadContainers();
  }

  async loadContainers(): Promise<void> {
    await this.store.loadContainers();
  }

  getMarkerContent(container: ContainerEntity): HTMLElement {
    const div = document.createElement('div');
    div.innerHTML = this.generateMarkerHtml(container);
    return div;
  }

  onMarkerClick(marker: MapAdvancedMarker, container: ContainerEntity) {
    this.store.selectContainer(container);
    this.infoWindowContent.set(container);
    this.infoWindow.open(marker);
  }

  simulateRealTimeUpdate() {
    const items = this.containers();
    if (!items.length) return;

    const random = items[Math.floor(Math.random() * items.length)];
    const updates: Partial<ContainerEntity> = {};

    if (Math.random() > 0.5) {
      updates.currentFillLevel = Math.floor(Math.random() * 100);
    } else {
      const statuses = Object.values(ContainerStatusEnum);
      updates.status = statuses[Math.floor(Math.random() * statuses.length)];
    }

    this.store.updateContainer(random.id, updates);
  }

  private generateMarkerHtml(container: ContainerEntity): string {
    const statusConfig = {
      [ContainerStatusEnum.ACTIVE]: {
        color: '#16a34a',
        bgColor: '#f0fdf4',
        icon: 'pi-check-circle',
        label: 'Activo'
      },
      [ContainerStatusEnum.MAINTENANCE]: {
        color: '#ea580c',
        bgColor: '#fff7ed',
        icon: 'pi-wrench',
        label: 'Mantenimiento'
      },
      [ContainerStatusEnum.DECOMMISSIONED]: {
        color: '#dc2626',
        bgColor: '#fef2f2',
        icon: 'pi-times-circle',
        label: 'Fuera de Servicio'
      }
    };
    // Iconos por tipo (sin cambios)
    const typeConfig = {
      [ContainerTypeEnum.ORGANIC]: {
        icon: 'pi-sun',
        color: '#84cc16',
        label: 'Orgánico'
      },
      [ContainerTypeEnum.RECYCLABLE]: {
        icon: 'pi-sync',
        color: '#06b6d4',
        label: 'Reciclable'
      },
      [ContainerTypeEnum.GENERAL]: {
        icon: 'pi-trash',
        color: '#6b7280',
        label: 'General'
      }
    };

    const status = statusConfig[container.status];
    const type = typeConfig[container.containerType];
    const fillLevel = container.currentFillLevel;
    const isHigh = fillLevel > 80;

    return `
      <div class="custom-marker-wrapper" style="display: flex; align-items: center; justify-content: center; cursor: pointer;">
         ${isHigh || container.status === ContainerStatusEnum.MAINTENANCE ? `
          <div style="position: absolute; width: 100%; height: 100%; border-radius: 50%; opacity: 0.6; background-color: ${status.bgColor}; animation: pulse-ring 2s infinite;"></div>
        ` : ''}
        <div style="background-color: ${status.bgColor}; border: 3px solid ${status.color}; border-radius: 12px; padding: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); z-index: 1;">
           <div style="width: 40px; height: 40px; position: relative; margin-bottom: 4px;">
              <img src="assets/images/smart-trash.png" style="width: 100%; height: 100%; object-fit: contain;">
              <div style="position: absolute; top: -4px; right: -4px; width: 16px; height: 16px; background: ${type.color}; border-radius: 50%; border: 2px solid white;"></div>
           </div>
           <div style="text-align: center; border-top: 1px solid #eee; padding-top: 2px;">
              <div style="font-size: 10px; font-weight: 800; color: #333;">${container.id.substring(0, 4)}</div>
              <div style="font-size: 9px; font-weight: bold; color: ${isHigh ? '#dc2626' : '#666'}">${container.currentFillLevel}%</div>
           </div>
        </div>
      </div>
    `;
  }
}
