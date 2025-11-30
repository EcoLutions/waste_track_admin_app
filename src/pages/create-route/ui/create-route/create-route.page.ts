import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CreateRouteStore } from '../../model/store/create-route.store';
import { RouteTypeEnum } from '../../../../entities';

@Component({
  selector: 'app-create-route',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './create-route.page.html',
  styleUrl: './create-route.page.css'
})
export class CreateRoutePage implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  readonly store = inject(CreateRouteStore);

  routeForm!: FormGroup;

  // Accordion state
  expandedSection = signal<number>(0);

  readonly isLoading = computed(() => this.store.isLoading());
  readonly error = computed(() => this.store.error());
  readonly isSuccess = computed(() => this.store.isSuccess());
  readonly isFormValid = computed(() => this.store.isFormValid());
  readonly districtName = computed(() => this.store.districtName());
  readonly isLoadingOptions = computed(() => this.store.isLoadingOptions());
  readonly availableDrivers = computed(() => this.store.availableDrivers());
  readonly availableVehicles = computed(() => this.store.availableVehicles());

  readonly routeTypes = Object.values(RouteTypeEnum);

  ngOnInit(): void {
    this.initializeForm();
    this.syncFormWithStore();
    // Load available drivers and vehicles from backend
    this.store.loadAvailableOptions();
  }

  ngOnDestroy(): void {
    this.store.resetForm();
  }

  private initializeForm(): void {
    this.routeForm = this.fb.group({
      driverId: ['', Validators.required],
      vehicleId: ['', Validators.required],
      routeType: [RouteTypeEnum.REGULAR, Validators.required],
      scheduledDate: ['', Validators.required],
      scheduledStartTime: ['', Validators.required]
      // scheduledEndTime is calculated by backend
    });
  }

  private syncFormWithStore(): void {
    this.routeForm.valueChanges.subscribe(formValue => {
      this.store.updateFormData(formValue);
    });
  }

  // Helper method for field validation
  private isFieldValid(fieldName: string): boolean {
    return this.routeForm.get(fieldName)?.valid === true;
  }

  // Accordion Methods
  toggleSection(sectionIndex: number): void {
    if (this.expandedSection() === sectionIndex) {
      return;
    }
    this.expandedSection.set(sectionIndex);
  }

  goToNextSection(currentSection: number): void {
    if (currentSection < 2) {
      this.expandedSection.set(currentSection + 1);
      this.scrollToTop();
    }
  }

  goToPreviousSection(currentSection: number): void {
    if (currentSection > 0) {
      this.expandedSection.set(currentSection - 1);
      this.scrollToTop();
    }
  }

  private scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Section Validation Methods
  isSectionComplete(sectionIndex: number): boolean {
    switch (sectionIndex) {
      case 0: // Asignación de Recursos
        return this.isFieldValid('driverId') &&
          this.isFieldValid('vehicleId');

      case 1: // Tipo y Programación
        return this.isFieldValid('routeType') &&
          this.isFieldValid('scheduledDate') &&
          this.isFieldValid('scheduledStartTime');
          // scheduledEndTime removed - backend calculates it

      case 2: // Confirmación (always complete as it's informational)
        return true;

      default:
        return false;
    }
  }

  getSectionIconClass(sectionIndex: number): string {
    if (this.expandedSection() === sectionIndex) {
      return 'bg-green-600 text-white';
    }
    if (this.isSectionComplete(sectionIndex)) {
      return 'bg-green-100 text-green-600';
    }
    return 'bg-gray-100 text-gray-400';
  }

  getSectionCompletionClass(sectionIndex: number): string {
    if (this.isSectionComplete(sectionIndex)) {
      return 'bg-green-600';
    }
    if (this.expandedSection() === sectionIndex) {
      return 'bg-green-400';
    }
    return 'bg-gray-300';
  }

  getCompletedSectionsCount(): number {
    let count = 0;
    for (let i = 0; i < 3; i++) {
      if (this.isSectionComplete(i)) {
        count++;
      }
    }
    return count;
  }

  getCompletionPercentage(): number {
    // Count all required sections (0 and 1) for percentage
    const requiredSections = 2;
    let completed = 0;

    if (this.isSectionComplete(0)) completed++;
    if (this.isSectionComplete(1)) completed++;

    return Math.round((completed / requiredSections) * 100);
  }

  canSubmitForm(): boolean {
    // Must complete required sections (0 and 1)
    return this.isSectionComplete(0) && this.isSectionComplete(1);
  }

  // Form Methods
  onSubmit(): void {
    if (this.canSubmitForm()) {
      this.store.createRoute();
    } else {
      this.markFormGroupTouched();
      // Expand first incomplete required section
      if (!this.isSectionComplete(0)) {
        this.expandedSection.set(0);
      } else if (!this.isSectionComplete(1)) {
        this.expandedSection.set(1);
      }
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.routeForm.controls).forEach(key => {
      const control = this.routeForm.get(key);
      control?.markAsTouched();
    });
  }

  onReset(): void {
    this.routeForm.reset({
      driverId: '',
      vehicleId: '',
      routeType: RouteTypeEnum.REGULAR,
      scheduledDate: '',
      scheduledStartTime: ''
    });
    this.store.resetForm();
    this.expandedSection.set(0);
  }

  // Helper Methods
  isFieldInvalid(fieldName: string): boolean {
    const field = this.routeForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getFieldError(fieldName: string): string {
    const field = this.routeForm.get(fieldName);
    if (field && field.errors && field.touched) {
      if (field.errors['required']) return 'Este campo es requerido';
      return 'Campo inválido';
    }
    return '';
  }

  getRouteTypeLabel(type: RouteTypeEnum): string {
    const labels = {
      [RouteTypeEnum.REGULAR]: 'Regular',
      [RouteTypeEnum.EMERGENCY]: 'Emergencia',
      [RouteTypeEnum.OPTIMIZED]: 'Optimizada'
    };
    return labels[type] || type;
  }

  getRouteTypeIcon(type: RouteTypeEnum): string {
    const icons = {
      [RouteTypeEnum.REGULAR]: 'pi-calendar',
      [RouteTypeEnum.EMERGENCY]: 'pi-exclamation-triangle',
      [RouteTypeEnum.OPTIMIZED]: 'pi-chart-line'
    };
    return icons[type] || 'pi-map';
  }

  getTodayDate(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-PE');
  }

  formatTime(timeString: string): string {
    if (!timeString) return '';
    return timeString;
  }

  getDriverName(driverId: string): string {
    if (!driverId) return 'Sin asignar';
    const driver = this.availableDrivers().find((d: any) => d.id === driverId);
    if (!driver) return 'Sin asignar';
    return `${driver.firstName} ${driver.lastName}`;
  }

  getVehiclePlate(vehicleId: string): string {
    if (!vehicleId) return 'Sin asignar';
    const vehicle = this.availableVehicles().find((v: any) => v.id === vehicleId);
    return vehicle?.licensePlate || 'Sin asignar';
  }

  getVehicleType(vehicleId: string): string {
    if (!vehicleId) return '';
    const vehicle = this.availableVehicles().find((v: any) => v.id === vehicleId);
    return vehicle?.vehicleType || '';
  }

  getDriverDisplayText(driver: any): string {
    return `${driver.firstName} ${driver.lastName}`;
  }

  getVehicleDisplayText(vehicle: any): string {
    return `${vehicle.licensePlate} - ${vehicle.vehicleType}`;
  }
}
