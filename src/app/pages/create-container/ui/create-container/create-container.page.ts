import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CreateContainerStore } from '../../model/store/create-container.store';
import { ContainerTypeEnum, ContainerStatusEnum } from '../../../../../entities';
import {LeafletDirective} from '@bluehalo/ngx-leaflet';
import * as L from 'leaflet';
import {GeoSearchControl, OpenStreetMapProvider} from 'leaflet-geosearch';

@Component({
  selector: 'app-create-container',
  imports: [CommonModule, ReactiveFormsModule, LeafletDirective],
  templateUrl: './create-container.page.html',
  styleUrl: './create-container.page.css'
})
export class CreateContainerPage implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  readonly store = inject(CreateContainerStore);

  // Form
  containerForm!: FormGroup;

  // LeaFlet map
  map!: L.Map;
  marker!: L.Marker;
  searchControl: any;

  mapOptions: L.MapOptions = {
    layers: [
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '© OpenStreetMap contributors'
      })
    ],
    zoom: 13,
    center: L.latLng(-12.0464, -77.0428) // Lima, Perú
  };

  // Signals for template
  readonly isLoading = computed(() => this.store.isLoading());
  readonly error = computed(() => this.store.error());
  readonly isSuccess = computed(() => this.store.isSuccess());
  readonly isFormValid = computed(() => this.store.isFormValid());

  // Container type options
  readonly containerTypes = Object.values(ContainerTypeEnum);

  // Status options (default to ACTIVE for new containers)
  readonly statusOptions = [ContainerStatusEnum.ACTIVE];

  ngOnInit(): void {
    this.initializeForm();
    this.syncFormWithStore();
    this.watchCoordinateChanges();
  }

  ngOnDestroy(): void {
    // Reset form when leaving the page
    this.store.resetForm();
  }

  private initializeForm(): void {
    this.containerForm = this.fb.group({
      latitude: ['', [Validators.required, Validators.pattern(/^-?([1-8]?[1-9]|[1-9]0)\.{1}\d{1,6}$/)]],
      longitude: ['', [Validators.required, Validators.pattern(/^-?([1-8]?[1-9]|[1-9]0)\.{1}\d{1,6}$/)]],
      address: ['', [Validators.required, Validators.minLength(10)]],
      districtCode: ['', [Validators.required, Validators.minLength(2)]],
      volumeLiters: [240, [Validators.required, Validators.min(50), Validators.max(5000)]],
      maxWeightKg: [100, [Validators.required, Validators.min(10), Validators.max(1000)]],
      containerType: [ContainerTypeEnum.GENERAL, Validators.required],
      sensorId: [''],
      districtId: ['', [Validators.required, Validators.minLength(2)]],
      collectionFrequencyDays: [7, [Validators.required, Validators.min(1), Validators.max(30)]]
    });
  }

  private syncFormWithStore(): void {
    // Sync form changes with store
    this.containerForm.valueChanges.subscribe(formValue => {
      this.store.updateFormData(formValue);
    });

    // Sync store changes with form (for external updates)
    // This could be useful if we want to pre-populate form from store
  }

  onSubmit(): void {
    if (this.containerForm.valid) {
      this.store.createContainer();
    } else {
      this.markFormGroupTouched();
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.containerForm.controls).forEach(key => {
      const control = this.containerForm.get(key);
      control?.markAsTouched();
    });
  }

  onReset(): void {
    this.containerForm.reset({
      latitude: '',
      longitude: '',
      address: '',
      districtCode: '',
      volumeLiters: 240,
      maxWeightKg: 100,
      containerType: ContainerTypeEnum.GENERAL,
      sensorId: '',
      districtId: '',
      collectionFrequencyDays: 7
    });
    this.store.resetForm();
  }

  // Helper methods for template
  isFieldInvalid(fieldName: string): boolean {
    const field = this.containerForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getFieldError(fieldName: string): string {
    const field = this.containerForm.get(fieldName);
    if (field && field.errors && field.touched) {
      if (field.errors['required']) return `${fieldName} es requerido`;
      if (field.errors['minlength']) return `${fieldName} debe tener al menos ${field.errors['minlength'].requiredLength} caracteres`;
      if (field.errors['pattern']) return `${fieldName} tiene un formato inválido`;
      if (field.errors['min']) return `${fieldName} debe ser mayor a ${field.errors['min'].min}`;
      if (field.errors['max']) return `${fieldName} debe ser menor a ${field.errors['max'].max}`;
    }
    return '';
  }

  getContainerTypeLabel(type: ContainerTypeEnum): string {
    const labels = {
      [ContainerTypeEnum.ORGANIC]: 'Orgánico',
      [ContainerTypeEnum.RECYCLABLE]: 'Reciclable',
      [ContainerTypeEnum.GENERAL]: 'General'
    };
    return labels[type] || type;
  }

  onMapReady(map: L.Map): void {
    this.map = map;
    this.initializeSearchControl();
    this.initializeMarker();
    this.setupMapClickListener();
  }

  private initializeSearchControl(): void {
    const provider = new OpenStreetMapProvider();

    this.searchControl = new (GeoSearchControl as any)({
      provider: provider,
      style: 'bar',
      showMarker: false,
      autoClose: true,
      retainZoomLevel: false,
      animateZoom: true,
      keepResult: true,
      searchLabel: 'Buscar dirección...'
    });

    this.map.addControl(this.searchControl);

    // Escuchar resultados de búsqueda
    this.map.on('geosearch/showlocation', (result: any) => {
      const { x, y, label } = result.location;
      this.updateLocationFromMap(y, x, label);
    });
  }

  private initializeMarker(): void {
    const icon = L.divIcon({
      html: `
      <div class="custom-map-marker">
        <div class="marker-pin"></div>
        <div class="marker-pulse"></div>
      </div>
    `,
      className: 'custom-marker-container',
      iconSize: [40, 40],
      iconAnchor: [20, 40]
    });

    // Posición inicial en Lima
    this.marker = L.marker([-12.0464, -77.0428], {
      icon: icon,
      draggable: true
    }).addTo(this.map);

    // Evento cuando se arrastra el marcador
    this.marker.on('dragend', () => {
      const position = this.marker.getLatLng();
      this.updateLocationFromMap(position.lat, position.lng);
    });
  }

  private setupMapClickListener(): void {
    this.map.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      this.marker.setLatLng([lat, lng]);
      this.updateLocationFromMap(lat, lng);
    });
  }

  private updateLocationFromMap(lat: number, lng: number, address?: string): void {
    this.containerForm.patchValue({
      latitude: lat.toFixed(6),
      longitude: lng.toFixed(6)
    });

    if (address) {
      this.containerForm.patchValue({ address });
    } else {
      this.reverseGeocode(lat, lng).then(() => {});
    }

    this.marker.setLatLng([lat, lng]);
    this.map.setView([lat, lng], this.map.getZoom());
  }

  private async reverseGeocode(lat: number, lng: number): Promise<void> {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      );
      const data = await response.json();

      if (data && data.display_name) {
        this.containerForm.patchValue({
          address: data.display_name
        });
      }
    } catch (error) {
      console.error('Error en reverse geocoding:', error);
    }
  }

  private watchCoordinateChanges(): void {
    // Sincronizar cambios manuales de coordenadas con el mapa
    this.containerForm.get('latitude')?.valueChanges.subscribe(lat => {
      if (lat && this.marker) {
        const lng = this.containerForm.get('longitude')?.value;
        if (lng) {
          const latNum = parseFloat(lat);
          const lngNum = parseFloat(lng);
          if (!isNaN(latNum) && !isNaN(lngNum)) {
            this.marker.setLatLng([latNum, lngNum]);
            this.map.setView([latNum, lngNum], this.map.getZoom());
          }
        }
      }
    });

    this.containerForm.get('longitude')?.valueChanges.subscribe(lng => {
      if (lng && this.marker) {
        const lat = this.containerForm.get('latitude')?.value;
        if (lat) {
          const latNum = parseFloat(lat);
          const lngNum = parseFloat(lng);
          if (!isNaN(latNum) && !isNaN(lngNum)) {
            this.marker.setLatLng([latNum, lngNum]);
            this.map.setView([latNum, lngNum], this.map.getZoom());
          }
        }
      }
    });
  }
}
