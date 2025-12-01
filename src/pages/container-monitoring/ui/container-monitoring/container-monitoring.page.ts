import {Component, computed, inject, OnInit, signal, ViewChild} from '@angular/core';
import {ContainerMonitoringStore} from '../../model/store/container-monitoring.store';
import {ContainerEntity, ContainerStatusEnum, ContainerTypeEnum} from '../../../../entities';
import {GoogleMap, MapAdvancedMarker, MapInfoWindow} from '@angular/google-maps';
import {environment} from '../../../../environments/environment.development';
import {CommonModule} from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-container-monitoring',
  standalone: true,
  imports: [CommonModule, GoogleMap, MapAdvancedMarker, MapInfoWindow, ReactiveFormsModule],
  templateUrl: './container-monitoring.page.html',
  styleUrl: './container-monitoring.page.css'
})
export class ContainerMonitoringPage implements OnInit {
  readonly store = inject(ContainerMonitoringStore);
  private fb = inject(FormBuilder);

  // Referencia al InfoWindow
  @ViewChild(MapInfoWindow) infoWindow!: MapInfoWindow;
  @ViewChild(GoogleMap) map!: GoogleMap;

  // Cache para los contenidos de los markers
  private markerContentCache = new Map<string, HTMLElement>();

  // Estado UI
  infoWindowContent = signal<ContainerEntity | null>(null);
  filtersPanelOpen = false;
  isEditModalOpen = false;
  isSaving = false;

  isSelectingLocation = false;
  tempLocation = signal<google.maps.LatLngLiteral | null>(null);

  // Formulario de edición
  editForm: FormGroup = this.fb.group({
    id: [''], // Readonly
    status: ['', Validators.required],
    containerType: ['', Validators.required],
    currentFillLevel: [0, [Validators.min(0), Validators.max(100)]],
    volumeLiters: [0, [Validators.required, Validators.min(1)]],
    maxFillLevel: [0, [Validators.required, Validators.min(1)]],
    collectionFrequencyDays: [1, [Validators.required, Validators.min(1)]],
    deviceId: [''],
    latitude: ['', Validators.required],
    longitude: ['', Validators.required]
  });

  // Enums para el template
  statusEnum = Object.values(ContainerStatusEnum);
  typeEnum = Object.values(ContainerTypeEnum);

  // Opciones del mapa
  mapOptions: google.maps.MapOptions = {
    mapId: environment.googleMaps.mapIds.depot,
    disableDefaultUI: false,
    clickableIcons: false,
    streetViewControl: false,
    fullscreenControl: false,
    gestureHandling: 'greedy'
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

  // --- Lógica del Modal ---

  openDetailModal(container: ContainerEntity) {
    this.store.selectContainer(container);

    console.log('Opening detail modal for container', container);

    this.editForm.patchValue({
      id: container.id,
      status: container.status,
      containerType: container.containerType,
      currentFillLevel: container.currentFillLevel,
      volumeLiters: container.volumeLiters,
      maxFillLevel: container.maxFillLevel,
      collectionFrequencyDays: container.collectionFrequencyDays,
      deviceId: container.deviceId,
      latitude: container.latitude,
      longitude: container.longitude
    });

    this.infoWindow.close();
    this.isEditModalOpen = true;
  }

  closeDetailModal() {
    if (this.isSelectingLocation) {
      this.cancelLocationSelection();
      return;
    }
    this.isEditModalOpen = false;
    this.store.selectContainer(null);
  }

  enableLocationPicker() {
    const currentLat = parseFloat(this.editForm.get('latitude')?.value);
    const currentLng = parseFloat(this.editForm.get('longitude')?.value);

    // Establecer posición temporal inicial
    if (!isNaN(currentLat) && !isNaN(currentLng)) {
      this.tempLocation.set({ lat: currentLat, lng: currentLng });
    }

    this.isEditModalOpen = false; // Ocultar modal temporalmente
    this.isSelectingLocation = true; // Activar modo selección
  }

  confirmLocationSelection() {
    const loc = this.tempLocation();
    if (loc) {
      this.editForm.patchValue({
        latitude: loc.lat.toFixed(6),
        longitude: loc.lng.toFixed(6)
      });
    }
    this.isSelectingLocation = false;
    this.isEditModalOpen = true;
  }

  cancelLocationSelection() {
    this.isSelectingLocation = false;
    this.isEditModalOpen = true;
  }

  onMapDrag(event: google.maps.MapMouseEvent) {
    if (this.isSelectingLocation && event.latLng) {
      this.tempLocation.set(event.latLng.toJSON());
    }
  }

  onMarkerDragEnd(event: google.maps.MapMouseEvent) {
    if (this.isSelectingLocation && event.latLng) {
      this.tempLocation.set(event.latLng.toJSON());
    }
  }

  async saveContainerChanges() {
    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    const form = this.editForm.value;

    // Mapeo manual para asegurar coincidencia con tu Backend Java y CURL
    // El CURL usa: containerId, latitude, longitude, volumeLiters, maxFillLevel, deviceId, containerType, collectionFrequencyDays
    const updates: any = {
      containerId: form.id,
      latitude: String(form.latitude),
      longitude: String(form.longitude),
      volumeLiters: Number(form.volumeLiters),
      maxFillLevel: Number(form.maxFillLevel), // En backend Java es maxWeightKg, aquí lo mandamos como maxFillLevel según tu CURL
      deviceId: form.deviceId,
      containerType: form.containerType,
      status: form.status, // Agregamos status aunque no esté en el CURL de ejemplo, suele ser necesario
      collectionFrequencyDays: Number(form.collectionFrequencyDays),
      currentFillLevel: Number(form.currentFillLevel)
    };

    try {
      // Usamos updateContainer del store que llama al servicio PUT
      await this.store.updateContainer(form.id, updates);
      this.isEditModalOpen = false;
      this.store.selectContainer(null);
      // Aquí podrías agregar un Toast de éxito
    } catch (err) {
      console.error('Error updating container', err);
    } finally {
      this.isSaving = false;
    }
  }
  // --- Helpers de UI para el Modal ---

  get fillPercentage() {
    return this.editForm.get('currentFillLevel')?.value || 0;
  }

  get fillLevelColor() {
    const level = this.fillPercentage;
    if (level > 80) return 'bg-red-500';
    if (level > 50) return 'bg-orange-500';
    return 'bg-green-500';
  }

  getMarkerContent(container: ContainerEntity): HTMLElement {
    const existing = this.markerContentCache.get(container.id);
    if (existing) return existing;

    console.log('render marker for', container.id);
    const div = document.createElement('div');
    div.innerHTML = this.generateMarkerHtml(container);
    this.markerContentCache.set(container.id, div);
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

    this.markerContentCache.delete(random.id);
  }

  protected formatContainerType(type: string[]): string {
    const typeLabels = type.map(t => {
      switch (t) {
        case ContainerTypeEnum.ORGANIC:
          return 'Orgánico';
        case ContainerTypeEnum.RECYCLABLE:
          return 'Reciclable';
        case ContainerTypeEnum.GENERAL:
          return 'General';
        default:
          return 'Desconocido';
      }
    });
    return typeLabels.join(', ');
  }

  protected formatContainerStatus(status: string[]): string {
    const statusLabels = status.map(s => {
      switch (s) {
        case ContainerStatusEnum.ACTIVE:
          return 'Activo';
        case ContainerStatusEnum.MAINTENANCE:
          return 'Mantenimiento';
        case ContainerStatusEnum.DECOMMISSIONED:
          return 'Fuera de Servicio';
        default:
          return 'Desconocido';
      }
    }
    );
    return statusLabels.join(', ');
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
