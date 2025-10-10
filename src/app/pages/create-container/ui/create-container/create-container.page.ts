import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CreateContainerStore } from '../../model/store/create-container.store';
import { ContainerTypeEnum, ContainerStatusEnum } from '../../../../../entities';

@Component({
  selector: 'app-create-container',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-container.page.html',
  styleUrl: './create-container.page.css'
})
export class CreateContainerPage implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  readonly store = inject(CreateContainerStore);

  // Form
  containerForm!: FormGroup;

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
}
