import { Component, OnInit, OnDestroy, inject, computed } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CreateDriverStore } from '../../model/store/create-driver.store';
import {DriverStatusEnum} from '../../../../../entities';

@Component({
  selector: 'app-create-driver',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './create-driver.page.html',
  styleUrl: './create-driver.page.css'
})
export class CreateDriverPage implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  readonly store = inject(CreateDriverStore);

  // Form
  driverForm!: FormGroup;

  // Signals for template
  readonly isLoading = computed(() => this.store.isLoading());
  readonly error = computed(() => this.store.error());
  readonly isSuccess = computed(() => this.store.isSuccess());
  readonly isFormValid = computed(() => this.store.isFormValid());
  readonly districtName = computed(() => this.store.districtName());

  // Status options
  readonly driverStatuses = Object.values(DriverStatusEnum);

  ngOnInit(): void {
    this.initializeForm();
    this.syncFormWithStore();
  }

  ngOnDestroy(): void {
    // Reset form when leaving the page
    this.store.resetForm();
  }

  private initializeForm(): void {
    this.driverForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      documentNumber: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(12)]],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^\+?[\d\s\-\(\)]+$/)]],
      emailAddress: ['', [Validators.required, Validators.email]],
      driverLicense: ['', [Validators.required, Validators.minLength(6)]],
      licenseExpiryDate: ['', Validators.required],
      status: [DriverStatusEnum.AVAILABLE, Validators.required],
      assignedVehicleId: ['']
    });
  }

  private syncFormWithStore(): void {
    // Sync form changes with store
    this.driverForm.valueChanges.subscribe(formValue => {
      this.store.updateFormData(formValue);
    });
  }

  onSubmit(): void {
    if (this.driverForm.valid) {
      this.store.createDriver();
    } else {
      this.markFormGroupTouched();
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.driverForm.controls).forEach(key => {
      const control = this.driverForm.get(key);
      control?.markAsTouched();
    });
  }

  onReset(): void {
    this.driverForm.reset({
      firstName: '',
      lastName: '',
      documentNumber: '',
      phoneNumber: '',
      emailAddress: '',
      driverLicense: '',
      licenseExpiryDate: '',
      status: DriverStatusEnum.AVAILABLE,
      assignedVehicleId: ''
    });
    this.store.resetForm();
  }

  // Helper methods for template
  isFieldInvalid(fieldName: string): boolean {
    const field = this.driverForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getFieldError(fieldName: string): string {
    const field = this.driverForm.get(fieldName);
    if (field && field.errors && field.touched) {
      if (field.errors['required']) return `${fieldName} es requerido`;
      if (field.errors['minlength']) return `${fieldName} debe tener al menos ${field.errors['minlength'].requiredLength} caracteres`;
      if (field.errors['maxlength']) return `${fieldName} no debe exceder ${field.errors['maxlength'].requiredLength} caracteres`;
      if (field.errors['email']) return `${fieldName} debe tener un formato válido`;
      if (field.errors['pattern']) return `${fieldName} tiene un formato inválido`;
    }
    return '';
  }

  getStatusLabel(status: DriverStatusEnum): string {
    const labels = {
      [DriverStatusEnum.AVAILABLE]: 'Disponible',
      [DriverStatusEnum.ON_ROUTE]: 'En Ruta',
      [DriverStatusEnum.OFF_DUTY]: 'Fuera de Servicio',
      [DriverStatusEnum.SUSPENDED]: 'Suspendido'
    };
    return labels[status] || status;
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-PE');
  }
}
