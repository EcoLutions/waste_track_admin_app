import { Component, OnInit, OnDestroy, inject, computed, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CreateVehicleStore } from '../../model/store/create-vehicle.store';
import { VehicleTypeEnum } from '../../../../../entities';

@Component({
  selector: 'app-create-vehicle',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './create-vehicle.page.html',
  styleUrl: './create-vehicle.page.css'
})
export class CreateVehiclePage implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  readonly store = inject(CreateVehicleStore);

  vehicleForm!: FormGroup;

  // Accordion state
  expandedSection = signal<number>(0); // Start with first section expanded

  readonly isLoading = computed(() => this.store.isLoading());
  readonly error = computed(() => this.store.error());
  readonly isSuccess = computed(() => this.store.isSuccess());
  readonly isFormValid = computed(() => this.store.isFormValid());
  readonly districtName = computed(() => this.store.districtName());

  readonly vehicleTypes = Object.values(VehicleTypeEnum);

  ngOnInit(): void {
    this.initializeForm();
    this.syncFormWithStore();
  }

  ngOnDestroy(): void {
    this.store.resetForm();
  }

  private initializeForm(): void {
    this.vehicleForm = this.fb.group({
      licensePlate: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(10)]],
      vehicleType: [VehicleTypeEnum.TRUCK, Validators.required],
      volumeCapacity: [1000, [Validators.required, Validators.min(100), Validators.max(10000)]],
      weightCapacity: [5000, [Validators.required, Validators.min(500), Validators.max(50000)]],
      mileage: [0, [Validators.required, Validators.min(0)]],
      assignedDriverId: [''],
      lastMaintenanceDate: [''],
      nextMaintenanceDate: [''],
      isActive: [true]
    });
  }

  private syncFormWithStore(): void {
    this.vehicleForm.valueChanges.subscribe(formValue => {
      this.store.updateFormData(formValue);
    });
  }

  // Accordion Methods
  toggleSection(sectionIndex: number): void {
    if (this.expandedSection() === sectionIndex) {
      // Don't close if it's the only section or first incomplete section
      return;
    }
    this.expandedSection.set(sectionIndex);
  }

  goToNextSection(currentSection: number): void {
    if (currentSection < 3) {
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
    // Smooth scroll to top of form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Section Validation Methods
  isSectionComplete(sectionIndex: number): boolean {
    switch (sectionIndex) {
      case 0: // Información Básica
        const licensePlate = this.vehicleForm.get('licensePlate');
        const vehicleType = this.vehicleForm.get('vehicleType');
        return licensePlate?.valid === true && vehicleType?.valid === true;

      case 1: // Capacidades
        const volumeCapacity = this.vehicleForm.get('volumeCapacity');
        const weightCapacity = this.vehicleForm.get('weightCapacity');
        const mileage = this.vehicleForm.get('mileage');
        return volumeCapacity?.valid === true &&
          weightCapacity?.valid === true &&
          mileage?.valid === true;

      case 2: // Mantenimiento (optional)
        return true;

      case 3: // Configuración (optional)
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
    for (let i = 0; i < 4; i++) {
      if (this.isSectionComplete(i)) {
        count++;
      }
    }
    return count;
  }

  getCompletionPercentage(): number {
    // Only count required sections (0 and 1) for percentage
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
      this.store.createVehicle();
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
    Object.keys(this.vehicleForm.controls).forEach(key => {
      const control = this.vehicleForm.get(key);
      control?.markAsTouched();
    });
  }

  onReset(): void {
    this.vehicleForm.reset({
      licensePlate: '',
      vehicleType: VehicleTypeEnum.TRUCK,
      volumeCapacity: 1000,
      weightCapacity: 5000,
      mileage: 0,
      assignedDriverId: '',
      lastMaintenanceDate: '',
      nextMaintenanceDate: '',
      isActive: true
    });
    this.store.resetForm();
    this.expandedSection.set(0);
  }

  // Helper Methods
  isFieldInvalid(fieldName: string): boolean {
    const field = this.vehicleForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getFieldError(fieldName: string): string {
    const field = this.vehicleForm.get(fieldName);
    if (field && field.errors && field.touched) {
      if (field.errors['required']) return 'Este campo es requerido';
      if (field.errors['minlength']) return `Mínimo ${field.errors['minlength'].requiredLength} caracteres`;
      if (field.errors['maxlength']) return `Máximo ${field.errors['maxlength'].requiredLength} caracteres`;
      if (field.errors['min']) return `Valor mínimo: ${field.errors['min'].min}`;
      if (field.errors['max']) return `Valor máximo: ${field.errors['max'].max}`;
      if (field.errors['pattern']) return 'Formato inválido';
    }
    return '';
  }

  getVehicleTypeLabel(type: VehicleTypeEnum): string {
    const labels = {
      [VehicleTypeEnum.COMPACTOR]: 'Compactador',
      [VehicleTypeEnum.TRUCK]: 'Camión',
      [VehicleTypeEnum.MINI_TRUCK]: 'Mini Camión'
    };
    return labels[type] || type;
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
}
