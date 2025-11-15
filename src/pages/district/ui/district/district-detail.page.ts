import {Component, computed, effect, ElementRef, inject, OnDestroy, OnInit, signal, ViewChild} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {DistrictDetailStore} from '../../model/store/district-detail.store';
import {DistrictContextStore} from '../../../../shared/stores/district-context.store';
import {OperationalStatusEnum} from '../../../../entities';
import {InputTextModule} from 'primeng/inputtext';
import {DurationUtils} from '../../../../shared/libs/utils/duration.utils';
import {GoogleMapsLoaderService} from '../../../../shared/api/services/google-maps-loader.service';
import {environment} from '../../../../environments/environment';
import {GoogleMap, GoogleMapsModule} from '@angular/google-maps';

@Component({
  selector: 'app-district-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    InputTextModule,
    GoogleMapsModule
  ],
  templateUrl: './district-detail.page.html',
  styleUrl: './district-detail.page.css'
})
export class DistrictDetailPage implements OnInit, OnDestroy {
  readonly store = inject(DistrictDetailStore);
  readonly districtContextStore = inject(DistrictContextStore);
  private readonly googleMapsLoader = inject(GoogleMapsLoaderService);

  @ViewChild('depotMapComp', { read: GoogleMap }) depotMapComp?: GoogleMap;
  @ViewChild('disposalMapComp', { read: GoogleMap }) disposalMapComp?: GoogleMap;
  @ViewChild('depotSearchInput', { read: ElementRef }) depotSearchInput?: ElementRef;
  @ViewChild('disposalSearchInput', { read: ElementRef }) disposalSearchInput?: ElementRef;

  // Loader signals
  depotMapLoaded = signal(false);
  disposalMapLoaded = signal(false);
  depotSearchLoading = signal(false);
  disposalSearchLoading = signal(false);

  // Map bindings
  depotCenter: google.maps.LatLngLiteral = { lat: 0, lng: 0 };
  disposalCenter: google.maps.LatLngLiteral = { lat: 0, lng: 0 };
  depotZoom = 15;
  disposalZoom = 15;
  depotMapOptions: google.maps.MapOptions = {
    disableDefaultUI: false,
    zoomControl: true,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: true,
    mapId: environment.googleMaps.mapIds.depot
  };
  disposalMapOptions: google.maps.MapOptions = {
    disableDefaultUI: false,
    zoomControl: true,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: true,
    mapId: environment.googleMaps.mapIds.disposal
  };

  // Computed from store
  readonly district = computed(() => this.store.district());
  readonly isLoading = computed(() => this.store.isLoading());
  readonly isEditMode = computed(() => this.store.isEditMode());
  readonly isSaving = computed(() => this.store.isSaving());
  readonly error = computed(() => this.store.error());
  readonly successMessage = computed(() => this.store.successMessage());
  readonly isFormValid = computed(() => this.store.isFormValid());
  readonly hasChanges = computed(() => this.store.hasChanges());
  readonly readOnlyData = computed(() => this.store.readOnlyData());
  readonly editFormData = computed(() => this.store.editFormData());

  // Usage percentages
  readonly vehicleUsage = computed(() => this.store.vehicleUsagePercentage());
  readonly driverUsage = computed(() => this.store.driverUsagePercentage());
  readonly containerUsage = computed(() => this.store.containerUsagePercentage());

  readonly showDepotMap = computed(() => this.store.showDepotMap());
  readonly showDisposalMap = computed(() => this.store.showDisposalMap());

  private depotMarker: any = null;
  private disposalMarker: any = null;
  private depotAutocomplete: any = null;
  private disposalAutocomplete: any = null;

  // Duration signals
  maxRouteDurationHours = signal(8);
  maxRouteDurationMinutes = signal(0);

  private syncDurationEffect = effect(() => {
    const isoDuration = this.editFormData().maxRouteDuration;
    if (isoDuration) {
      const { hours, minutes } = DurationUtils.parse(isoDuration);
      this.maxRouteDurationHours.set(hours);
      this.maxRouteDurationMinutes.set(minutes);
    }
  });

  ngOnInit(): void {
    this.initializePage().then(() => {});
  }

  ngOnDestroy(): void {
    this.store.resetState();
    this.destroyMaps();
  }

  private async initializePage(): Promise<void> {
    if (!this.districtContextStore.isDistrictLoaded()) {
      try {
        await this.districtContextStore.initializeDistrictContext();
      } catch (error) {
        console.error('Error initializing district context:', error);
      }
    }

    if (this.districtContextStore.districtId()) {
      await this.store.loadDistrict();
    }
  }

  // ========== EDIT MODE ==========
  enterEditMode(): void {
    this.store.enableEditMode();
  }

  cancelEdit(): void {
    this.store.cancelEditMode();
    this.destroyMaps();
  }

  async saveChanges(): Promise<void> {
    await this.store.saveChanges();
  }

  // ========== FORM UPDATES ==========
  onFieldChange(field: string, value: string): void {
    this.store.updateFormField(field, value);
  }

  onHoursChange(hours: number): void {
    this.maxRouteDurationHours.set(hours);
    this.store.updateDuration(hours, this.maxRouteDurationMinutes());
  }

  onMinutesChange(minutes: number): void {
    this.maxRouteDurationMinutes.set(minutes);
    this.store.updateDuration(this.maxRouteDurationHours(), minutes);
  }

  setDurationPreset(hours: number, minutes: number = 0): void {
    this.maxRouteDurationHours.set(hours);
    this.maxRouteDurationMinutes.set(minutes);
    this.store.updateDuration(hours, minutes);
  }

  incrementHours(): void {
    const current = this.maxRouteDurationHours();
    if (current < 24) {
      this.onHoursChange(current + 1);
    }
  }

  decrementHours(): void {
    const current = this.maxRouteDurationHours();
    if (current > 1) {
      this.onHoursChange(current - 1);
    }
  }

  incrementMinutes(): void {
    const current = this.maxRouteDurationMinutes();
    if (current < 55) {
      this.onMinutesChange(current + 5);
    }
  }

  decrementMinutes(): void {
    const current = this.maxRouteDurationMinutes();
    if (current > 0) {
      this.onMinutesChange(current - 5);
    }
  }

  // ========== GOOGLE MAPS ==========
  async toggleDepotMap(): Promise<void> {
    this.store.toggleDepotMap();

    if (this.showDepotMap()) {
      try {
        await this.googleMapsLoader.load();
        setTimeout(() => this.initializeDepotMap(), 50);
      } catch (error) {
        console.error('Error loading Google Maps:', error);
        this.store.setError('Error al cargar el mapa. Verifique su conexión.');
      }
    } else {
      this.destroyDepotMap();
    }
  }

  async toggleDisposalMap(): Promise<void> {
    this.store.toggleDisposalMap();

    if (this.showDisposalMap()) {
      try {
        await this.googleMapsLoader.load();
        setTimeout(() => this.initializeDisposalMap(), 50);
      } catch (error) {
        console.error('Error loading Google Maps:', error);
        this.store.setError('Error al cargar el mapa. Verifique su conexión.');
      }
    } else {
      this.destroyDisposalMap();
    }
  }

  private async initializeDepotMap(): Promise<void> {
    if (!this.depotMapComp) return;

    this.depotMapLoaded.set(false);

    try {
      const coords = this.store.depotCoordinates();
      this.depotCenter = { lat: coords.lat, lng: coords.lng };

      const { AdvancedMarkerElement } = await this.googleMapsLoader.importLibrary('marker');
      const { Autocomplete } = await this.googleMapsLoader.importLibrary('places');
      const { Geocoder } = await this.googleMapsLoader.importLibrary('geocoding');

      // Crear marcador avanzado sobre el mapa del componente
      const markerContent = document.createElement('div');
      markerContent.innerHTML = `
      <div style="
        background: linear-gradient(135deg, #f59e0b 0%, #ea580c 100%);
        width: 40px;
        height: 40px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 6px rgba(0,0,0,0.2);
      ">
        <i class="pi pi-warehouse" style="
          transform: rotate(45deg);
          color: white;
          font-size: 18px;
        "></i>
      </div>
    `;

      this.depotMarker = new AdvancedMarkerElement({
        map: this.depotMapComp.googleMap,
        position: { lat: coords.lat, lng: coords.lng },
        content: markerContent,
        gmpDraggable: true,
        title: '📦 Depósito'
      });

      if (this.depotSearchInput) {
        this.depotAutocomplete = new Autocomplete(
          this.depotSearchInput.nativeElement,
          {
            fields: ['formatted_address', 'geometry', 'name'],
            componentRestrictions: { country: 'pe' }
          }
        );

        const pacContainer = document.querySelector('.pac-container') as HTMLElement;
        if (pacContainer) {
          pacContainer.style.zIndex = '10000';
        }

        this.depotAutocomplete.addListener('place_changed', () => {
          this.depotSearchLoading.set(true);

          const place = this.depotAutocomplete.getPlace();

          if (place.geometry && place.geometry.location) {
            const lat = typeof place.geometry.location.lat === 'function' ? place.geometry.location.lat() : place.geometry.location.lat;
            const lng = typeof place.geometry.location.lng === 'function' ? place.geometry.location.lng() : place.geometry.location.lng;

            this.store.updateDepotCoordinates(lat, lng);
            this.depotMarker!.position = { lat, lng } as any;
            this.depotMapComp!.googleMap?.setCenter({ lat, lng });
            this.depotMapComp!.googleMap?.setZoom(17);
          }

          this.depotSearchLoading.set(false);
        });
      }

      // Evento drag del marcador
      this.depotMarker.addListener('dragend', (e: any) => {
        const pos: any = e?.latLng ?? this.depotMarker?.position;
        const lat = typeof pos?.lat === 'function' ? pos.lat() : pos?.lat;
        const lng = typeof pos?.lng === 'function' ? pos.lng() : pos?.lng;
        if (lat != null && lng != null) {
          this.updateDepotLocationFromLatLng(lat, lng, Geocoder);
        }
      });

      // ✅ Marcar como cargado si ya se inicializó
      setTimeout(() => this.depotMapLoaded.set(true), 200);

    } catch (error) {
      console.error('Error initializing depot map:', error);
      this.store.setError('Error al cargar el mapa del depósito');
      this.depotMapLoaded.set(true);
    }
  }

  onDepotMapClick(e: any): void {
    if (!e?.latLng) return;
    const lat = typeof e.latLng.lat === 'function' ? e.latLng.lat() : e.latLng.lat;
    const lng = typeof e.latLng.lng === 'function' ? e.latLng.lng() : e.latLng.lng;
    if (this.depotMarker) {
      this.depotMarker.position = { lat, lng } as any;
    }
    // Geocodificar y actualizar store
    this.googleMapsLoader.importLibrary('geocoding').then(({ Geocoder }) => {
      this.updateDepotLocationFromLatLng(lat, lng, Geocoder);
    });
  }

  onDepotMapInitialized(_: google.maps.Map): void {
    setTimeout(() => this.depotMapLoaded.set(true), 200);
  }

  private updateDepotLocationFromLatLng(lat: number, lng: number, GeocoderClass: any): void {
    this.store.updateDepotCoordinates(lat, lng);

    const geocoder = new GeocoderClass();
    geocoder.geocode({ location: { lat, lng } }, (results: any, status: any) => {
      if (status === 'OK' && results[0] && this.depotSearchInput) {
        this.depotSearchInput.nativeElement.value = results[0].formatted_address;
      }
    });
  }

  private async initializeDisposalMap(): Promise<void> {
    if (!this.disposalMapComp) return;

    this.disposalMapLoaded.set(false);

    try {
      const coords = this.store.disposalCoordinates();
      this.disposalCenter = { lat: coords.lat, lng: coords.lng };

      const { AdvancedMarkerElement } = await this.googleMapsLoader.importLibrary('marker');
      const { Autocomplete } = await this.googleMapsLoader.importLibrary('places');
      const { Geocoder } = await this.googleMapsLoader.importLibrary('geocoding');

      const markerContent = document.createElement('div');
      markerContent.innerHTML = `
      <div style="
        background: linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%);
        width: 40px;
        height: 40px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 6px rgba(0,0,0,0.2);
      ">
        <i class="pi pi-trash" style="
          transform: rotate(45deg);
          color: white;
          font-size: 18px;
        "></i>
      </div>
    `;

      this.disposalMarker = new AdvancedMarkerElement({
        map: this.disposalMapComp.googleMap,
        position: { lat: coords.lat, lng: coords.lng },
        content: markerContent,
        gmpDraggable: true,
        title: '🗑️ Disposición Final'
      });

      if (this.disposalSearchInput) {
        this.disposalAutocomplete = new Autocomplete(
          this.disposalSearchInput.nativeElement,
          {
            fields: ['formatted_address', 'geometry', 'name'],
            componentRestrictions: { country: 'pe' }
          }
        );

        this.disposalAutocomplete.addListener('place_changed', () => {
          this.disposalSearchLoading.set(true);

          const place = this.disposalAutocomplete.getPlace();

          if (place.geometry && place.geometry.location) {
            const lat = typeof place.geometry.location.lat === 'function' ? place.geometry.location.lat() : place.geometry.location.lat;
            const lng = typeof place.geometry.location.lng === 'function' ? place.geometry.location.lng() : place.geometry.location.lng;

            this.store.updateDisposalCoordinates(lat, lng);
            this.disposalMarker!.position = { lat, lng } as any;
            this.disposalMapComp!.googleMap?.setCenter({ lat, lng });
            this.disposalMapComp!.googleMap?.setZoom(17);
          }

          this.disposalSearchLoading.set(false);
        });
      }

      this.disposalMarker.addListener('dragend', (e: any) => {
        const pos: any = e?.latLng ?? this.disposalMarker?.position;
        const lat = typeof pos?.lat === 'function' ? pos.lat() : pos?.lat;
        const lng = typeof pos?.lng === 'function' ? pos.lng() : pos?.lng;
        if (lat != null && lng != null) {
          this.updateDisposalLocationFromLatLng(lat, lng, Geocoder);
        }
      });

      // ✅ Marcar como cargado
      setTimeout(() => this.disposalMapLoaded.set(true), 200);

    } catch (error) {
      console.error('Error initializing disposal map:', error);
      this.store.setError('Error al cargar el mapa de disposición');
      this.disposalMapLoaded.set(true);
    }
  }

  onDisposalMapClick(e: any): void {
    if (!e?.latLng) return;
    const lat = typeof e.latLng.lat === 'function' ? e.latLng.lat() : e.latLng.lat;
    const lng = typeof e.latLng.lng === 'function' ? e.latLng.lng() : e.latLng.lng;
    if (this.disposalMarker) {
      this.disposalMarker.position = { lat, lng } as any;
    }
    this.googleMapsLoader.importLibrary('geocoding').then(({ Geocoder }) => {
      this.updateDisposalLocationFromLatLng(lat, lng, Geocoder);
    });
  }

  onDisposalMapInitialized(_: google.maps.Map): void {
    setTimeout(() => this.disposalMapLoaded.set(true), 200);
  }

  private updateDisposalLocationFromLatLng(lat: number, lng: number, GeocoderClass: any): void {
    this.store.updateDisposalCoordinates(lat, lng);

    const geocoder = new GeocoderClass();
    geocoder.geocode({ location: { lat, lng } }, (results: any, status: any) => {
      if (status === 'OK' && results[0] && this.disposalSearchInput) {
        this.disposalSearchInput.nativeElement.value = results[0].formatted_address;
      }
    });
  }

  private destroyDepotMap(): void {
    if (this.depotMarker) {
      this.depotMarker.map = null;
      this.depotMarker = null;
    }
  }

  private destroyDisposalMap(): void {
    if (this.disposalMarker) {
      this.disposalMarker.map = null;
      this.disposalMarker = null;
    }
  }

  private destroyMaps(): void {
    this.destroyDepotMap();
    this.destroyDisposalMap();
  }

  // ========== HELPERS ==========
  getOperationalStatusLabel(status: OperationalStatusEnum): string {
    const labels = {
      [OperationalStatusEnum.ACTIVE]: 'Activo',
      [OperationalStatusEnum.SUSPENDED]: 'Suspendido',
      [OperationalStatusEnum.TRIAL]: 'Prueba'
    } as any;
    return labels[status] || status;
  }

  getUsageColorClass(percentage: number): string {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-orange-500';
    if (percentage >= 50) return 'bg-yellow-500';
    return 'bg-emerald-500';
  }

  formatDate(date: Date | null): string {
    if (!date) return 'No disponible';
    return new Intl.DateTimeFormat('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(new Date(date));
  }

  formatNumber(value: number): string {
    return new Intl.NumberFormat('es-PE').format(value);
  }

  formatDuration(isoDuration: string | null): string {
    return DurationUtils.format(isoDuration);
  }

  formatDurationToMinutes(isoDuration: string | null): number {
    if (!isoDuration) return 0;
    const { totalMinutes } = DurationUtils.parse(isoDuration);
    return totalMinutes;
  }

  getDurationPercentage(isoDuration: string | null): number {
    return DurationUtils.getPercentage(isoDuration, 720);
  }

  protected readonly Number = Number;
}
