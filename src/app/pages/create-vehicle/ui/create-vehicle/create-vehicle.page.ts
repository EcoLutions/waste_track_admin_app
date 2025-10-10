import { Component, OnInit, OnDestroy, inject, computed } from '@angular/core';
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

  onSubmit(): void {
    if (this.vehicleForm.valid) {
      this.store.createVehicle();
    } else {
      this.markFormGroupTouched();
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
  }

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
