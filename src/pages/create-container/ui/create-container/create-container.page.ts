import {Component, computed, inject, OnDestroy, OnInit, signal, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {CreateContainerStore} from '../../model/store/create-container.store';
import {StepsModule} from 'primeng/steps';
import {MenuItem} from 'primeng/api';
import {ContainerTypeEnum} from '../../../../entities';
import {GoogleMap, MapAdvancedMarker} from '@angular/google-maps';
import {environment} from '../../../../environments/environment.development';

@Component({
  selector: 'app-create-container',
  imports: [CommonModule, ReactiveFormsModule, StepsModule, GoogleMap, MapAdvancedMarker],
  templateUrl: './create-container.page.html',
  styleUrl: './create-container.page.css'
})
export class CreateContainerPage implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  readonly store = inject(CreateContainerStore);

  // Google Maps
  @ViewChild(GoogleMap) mapComponent!: GoogleMap;

  // Posición del marcador
  markerPosition = signal<google.maps.LatLngLiteral | null>(null);

  readonly defaultCenter: google.maps.LatLngLiteral = {
    lat: -12.0464,
    lng: -77.0428
  };

  // Form
  containerForm!: FormGroup;

  mapOptions: google.maps.MapOptions = {
    mapId: environment.googleMaps.mapIds.depot,
    center: this.defaultCenter,
    zoom: 13,
    clickableIcons: false,
    streetViewControl: false,
    mapTypeControl: false
  };

  // Step
  activeStep = 0;

  steps: MenuItem[] = [
    {
      label: 'Ubicación',
      icon: 'pi pi-map-marker'
    },
    {
      label: 'Características',
      icon: 'pi pi-box'
    },
    {
      label: 'Configuración',
      icon: 'pi pi-cog'
    },
    {
      label: 'Confirmación',
      icon: 'pi pi-check'
    }
  ];

  // Signals for template
  readonly isLoading = computed(() => this.store.isLoading());
  readonly error = computed(() => this.store.error());
  readonly isSuccess = computed(() => this.store.isSuccess());
  readonly isFormValid = computed(() => this.store.isFormValid());

  // Container type options
  readonly containerTypes = Object.values(ContainerTypeEnum);

  ngOnInit(): void {
    this.initializeForm();
    this.syncFormWithStore();

    // Posición inicial: Lima
    this.markerPosition.set(this.defaultCenter);

    // Sincronizar formulario con esa posición inicial
    this.containerForm.patchValue({
      latitude: this.defaultCenter.lat.toFixed(6),
      longitude: this.defaultCenter.lng.toFixed(6)
    }, { emitEvent: false });

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
      volumeLiters: [240, [Validators.required, Validators.min(50), Validators.max(5000)]],
      maxFillLevel: [90, [Validators.required, Validators.min(1), Validators.max(99)]],
      containerType: [ContainerTypeEnum.GENERAL, Validators.required],
      deviceId: [''],
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
      volumeLiters: 240,
      maxFillLevel: 90,
      containerType: ContainerTypeEnum.GENERAL,
      deviceId: '',
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

  private updateLocationFromMap(lat: number, lng: number, address?: string): void {
    // Actualizar formulario (sin disparar los valueChanges otra vez)
    this.containerForm.patchValue({
      latitude: lat.toFixed(6),
      longitude: lng.toFixed(6)
    }, { emitEvent: false });

    if (address) {
      this.containerForm.patchValue({ address }, { emitEvent: false });
    } else {
      this.reverseGeocode(lat, lng).then(() => {});
    }

    // Actualizar marcador
    this.markerPosition.set({ lat, lng });

    // Centrar mapa
    if (this.mapComponent) {
      this.mapComponent.panTo({ lat, lng });
    }
  }

  private watchCoordinateChanges(): void {
    const latCtrl = this.containerForm.get('latitude');
    const lngCtrl = this.containerForm.get('longitude');

    latCtrl?.valueChanges.subscribe(lat => {
      const lng = lngCtrl?.value;
      this.updateFromManualCoords(lat, lng);
    });

    lngCtrl?.valueChanges.subscribe(lng => {
      const lat = latCtrl?.value;
      this.updateFromManualCoords(lat, lng);
    });
  }

  private updateFromManualCoords(lat: string | null, lng: string | null): void {
    if (!lat || !lng) return;

    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);

    if (isNaN(latNum) || isNaN(lngNum)) return;

    this.markerPosition.set({ lat: latNum, lng: lngNum });

    if (this.mapComponent) {
      this.mapComponent.panTo({ lat: latNum, lng: lngNum });
    }
  }

  nextStep(): void {
    if (this.activeStep < 3) {
      this.activeStep++;
    }
  }

  prevStep(): void {
    if (this.activeStep > 0) {
      this.activeStep--;
    }
  }

  goToStep(step: number): void {
    this.activeStep = step;
  }

  isStepValid(step: number): boolean {
    switch(step) {
      case 0: // Ubicación
        return !!(
          this.containerForm.get('latitude')?.valid &&
          this.containerForm.get('longitude')?.valid &&
          this.containerForm.get('address')?.valid
        );
      case 1: // Características
        return !!(
          this.containerForm.get('volumeLiters')?.valid &&
          this.containerForm.get('maxFillLevel')?.valid &&
          this.containerForm.get('containerType')?.valid
        );
      case 2: // Configuración
        return !!(this.containerForm.get('collectionFrequencyDays')?.valid);
      default:
        return true;
    }
  }

  // Click en el mapa
  onMapClick(event: google.maps.MapMouseEvent): void {
    if (!event.latLng) return;
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();
    this.updateLocationFromMap(lat, lng);
  }

  // Drag del marcador
  onMarkerDragEnd(event: google.maps.MapMouseEvent): void {
    if (!event.latLng) return;
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();
    this.updateLocationFromMap(lat, lng);
  }

  private async reverseGeocode(lat: number, lng: number): Promise<void> {
    if (!google || !google.maps) {
      console.warn('Google Maps API no está cargada aún');
      return;
    }
    const geocoder = new google.maps.Geocoder();

    try {
      const response = await geocoder.geocode({ location: { lat, lng } });
      if (response.results && response.results[0]) {

        this.containerForm.patchValue({
          address: response.results[0].formatted_address
        }, { emitEvent: false });

      } else {
        console.warn('No se encontraron resultados de dirección para estas coordenadas.');
      }

    } catch (error) {
      console.error('Error en Google Reverse Geocoding:', error);
    }
  }
}
