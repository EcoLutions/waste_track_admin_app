import { Component, computed, inject, OnDestroy, OnInit, signal, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

import { GoogleMap, MapAdvancedMarker } from '@angular/google-maps';

import { CreateReportStore } from '../../model/store/create-report.store';
import {
  ReportTypeEnum,
  ContainerEntity,
  ContainerService, ContainerStatusEnum, ContainerTypeEnum
} from '../../../../entities';

import { DistrictContextStore } from '../../../../shared/stores/district-context.store';
import { environment } from '../../../../environments/environment.development';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-create-report',
  standalone: true,
  imports: [CommonModule, FormsModule, GoogleMap, MapAdvancedMarker],
  templateUrl: './create-report.page.html',
  styleUrl: './create-report.page.css',
  providers: [CreateReportStore]
})
export class CreateReportPage implements OnInit, OnDestroy {
  readonly store = inject(CreateReportStore);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly containerService = inject(ContainerService);
  private readonly districtStore = inject(DistrictContextStore);

  // Reference to file input for triggering click programmatically
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  @ViewChild(GoogleMap) mapComponent!: GoogleMap;

  // --- MAP STATE ---

  // Cache para los contenidos de los markers
  private markerContentCache = new Map<string, HTMLElement>();

  readonly defaultCenter: google.maps.LatLngLiteral = {
    lat: -12.0464,
    lng: -77.0428
  };

  readonly mapOptions: google.maps.MapOptions = {
    mapId: environment.googleMaps.mapIds.depot,
    center: this.defaultCenter,
    zoom: 13,
    clickableIcons: false,
    streetViewControl: false,
    mapTypeControl: false
  };

  // Coordenada seleccionada (calle o contenedor)
  readonly selectedPosition = signal<google.maps.LatLngLiteral | null>(null);

  // Contenedores del distrito actual
  readonly containers = signal<ContainerEntity[]>([]);

  // Contenedor seleccionado (si aplica)
  readonly selectedContainer = signal<ContainerEntity | null>(null);

  // Centro y zoom reactivos del mapa
  readonly center = computed<google.maps.LatLngLiteral>(() => {
    const lat = this.store.latitude();
    const lng = this.store.longitude();

    if (lat !== null && lng !== null) {
      return { lat, lng };
    }

    return this.defaultCenter;
  });

  readonly zoom = signal(14);

  // --- Computed Signals from Store ---

  // Form Data
  readonly latitude = computed(() => this.store.latitude());
  readonly longitude = computed(() => this.store.longitude());
  readonly containerId = computed(() => this.store.containerId());
  readonly reportType = computed(() => this.store.reportType());
  readonly description = computed(() => this.store.description());

  // UI State
  readonly locationStatus = computed(() => this.store.locationStatus());
  readonly isValid = computed(() => this.store.isValid());
  readonly isSubmitting = computed(() => this.store.isSubmitting());
  readonly error = computed(() => this.store.error());
  readonly success = computed(() => this.store.success());

  // Evidence State
  readonly evidences = computed(() => this.store.evidences());
  readonly uploadingFiles = computed(() => this.store.uploadingFiles());

  // --- Local State ---
  readonly reportTypes = Object.values(ReportTypeEnum);

  async ngOnInit(): Promise<void> {
    console.log('Create Report Page Initialized');

    // Posición inicial del marcador (si ya hay coords en el store)
    if (this.store.latitude() !== null && this.store.longitude() !== null) {
      this.selectedPosition.set({
        lat: this.store.latitude()!,
        lng: this.store.longitude()!
      });
    }

    // Cargar contenedores del distrito para mostrarlos en el mapa
    await this.loadContainers();
  }

  ngOnDestroy(): void {
    // Clean up store state when leaving the page
    this.store.reset();
  }

  // ---------------------------------------------------------------------------
  // MAP INTERACTIONS (GOOGLE MAPS)
  // ---------------------------------------------------------------------------

  /**
   * Click en el mapa (selección de calle / punto libre).
   */
  onMapClick(event: google.maps.MapMouseEvent): void {
    if (!event.latLng) return;

    const lat = event.latLng.lat();
    const lng = event.latLng.lng();

    // Deseleccionar contenedor si había uno
    this.selectedContainer.set(null);

    // Actualizar marcador seleccionado
    this.selectedPosition.set({ lat, lng });
    this.zoom.set(17);

    // Actualizar store con coordenadas "libres" (sin contenedor)
    this.store.setCoordinates(lat, lng);
  }

  /**
   * Drag del marcador seleccionado.
   * Sigue siendo "calle", por lo que se limpia cualquier contenedor.
   */
  onMarkerDragEnd(event: google.maps.MapMouseEvent): void {
    if (!event.latLng) return;

    const lat = event.latLng.lat();
    const lng = event.latLng.lng();

    this.selectedContainer.set(null);
    this.selectedPosition.set({ lat, lng });

    this.store.setCoordinates(lat, lng);
  }

  /**
   * Click en el marcador de un contenedor registrado.
   */
  onContainerMarkerClick(container: ContainerEntity): void {
    const lat = Number(container.latitude);
    const lng = Number(container.longitude);

    if (isNaN(lat) || isNaN(lng)) {
      console.warn('Contenedor sin coordenadas válidas', container.id);
      return;
    }

    this.selectedContainer.set(container);
    this.selectedPosition.set({ lat, lng });
    this.zoom.set(18);

    // Vincular reporte al contenedor y a sus coordenadas
    this.store.setContainer(container.id, lat, lng);
  }

  /**
   * Carga de contenedores del distrito actual para mostrarlos en el mapa.
   */
  private async loadContainers(): Promise<void> {
    const districtId = this.districtStore.districtId();

    if (!districtId) {
      console.warn('No hay distrito activo, no se cargarán contenedores en el mapa.');
      return;
    }

    try {
      const list = await firstValueFrom(
        this.containerService.getAllByDistrictId(districtId)
      );

      const mappable = (list || []).filter((c: ContainerEntity) =>
        c.latitude &&
        c.longitude &&
        !isNaN(Number(c.latitude)) &&
        !isNaN(Number(c.longitude))
      );

      this.containers.set(mappable);
    } catch (error) {
      console.error('Error al cargar contenedores para el mapa de reportes:', error);
    }
  }

  // --- Form Actions ---

  onTypeChange(type: string): void {
    this.store.setType(type as ReportTypeEnum);
  }

  onDescriptionChange(text: string): void {
    this.store.setDescription(text);
  }

  // --- Evidence Management ---

  triggerFileInput(): void {
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.store.uploadEvidence(file);
      // Reset input to allow selecting the same file again if needed
      input.value = '';
    }
  }

  onRemoveEvidence(evidenceId: string): void {
    this.store.removeEvidence(evidenceId);
  }

  // --- Submission & Navigation ---

  async onSubmit(): Promise<void> {
    await this.store.submitReport();

    // If success is true (handled by store), the template will show the success view
    // Navigation back is handled in the success view button
  }

  onCancel(): void {
    this.router.navigate(['../'], { relativeTo: this.route });
  }

  // --- Helpers ---

  getTypeLabel(type: ReportTypeEnum): string {
    const labels: Record<string, string> = {
      [ReportTypeEnum.CONTAINER_FULL]: 'Contenedor Lleno',
      [ReportTypeEnum.CONTAINER_DAMAGED]: 'Contenedor Dañado',
      [ReportTypeEnum.GARBAGE_OUTSIDE]: 'Basura Fuera',
      [ReportTypeEnum.MISSED_COLLECTION]: 'Recolección Perdida',
      [ReportTypeEnum.OTHER]: 'Otro'
    };
    return labels[type] || type;
  }

  protected readonly ReportTypeEnum = ReportTypeEnum;

  getMarkerContent(container: ContainerEntity): HTMLElement {
    const existing = this.markerContentCache.get(container.id);
    if (existing) return existing;

    const div = document.createElement('div');
    div.innerHTML = this.generateMarkerHtml(container);
    this.markerContentCache.set(container.id, div);
    return div;
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
    } as const;

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
    } as const;

    const status = statusConfig[container.status];
    const type = typeConfig[container.containerType];
    const fillLevel = container.currentFillLevel;
    const isHigh = fillLevel > 80;

    return `
    <div class="custom-marker-wrapper"
         style="display:flex;align-items:center;justify-content:center;cursor:pointer;position:relative;">
      ${isHigh || container.status === ContainerStatusEnum.MAINTENANCE ? `
        <div style="
          position:absolute;
          width:100%;
          height:100%;
          border-radius:50%;
          opacity:0.6;
          background-color:${status.bgColor};
          animation:pulse-ring 2s infinite;
        "></div>
      ` : ''}

      <div style="
        background-color:${status.bgColor};
        border:3px solid ${status.color};
        border-radius:12px;
        padding:8px;
        box-shadow:0 4px 12px rgba(0,0,0,0.15);
        z-index:1;
      ">
        <div style="width:40px;height:40px;position:relative;margin-bottom:4px;">
          <img src="assets/images/smart-trash.png" style="width:100%;height:100%;object-fit:contain;">
          <div style="
            position:absolute;
            top:-4px;
            right:-4px;
            width:16px;
            height:16px;
            background:${type.color};
            border-radius:50%;
            border:2px solid white;
          "></div>
        </div>
        <div style="text-align:center;border-top:1px solid #eee;padding-top:2px;">
          <div style="font-size:10px;font-weight:800;color:#333;">${container.id.substring(0, 4)}</div>
          <div style="font-size:9px;font-weight:bold;color:${isHigh ? '#dc2626' : '#666'}">
            ${fillLevel}%
          </div>
        </div>
      </div>
    </div>
  `;
  }
}
