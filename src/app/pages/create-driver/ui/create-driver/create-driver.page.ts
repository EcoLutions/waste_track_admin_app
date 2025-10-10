import { Component, OnInit, OnDestroy, inject, computed, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CreateDriverStore } from '../../model/store/create-driver.store';
import { DriverStatusEnum } from '../../../../../entities';

@Component({
  selector: 'app-create-driver',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './create-driver.page.html',
  styleUrl: './create-driver.page.css'
})
export class CreateDriverPage implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  readonly store = inject(CreateDriverStore);

  driverForm!: FormGroup;

  // Accordion state
  expandedSection = signal<number>(0);

  readonly isLoading = computed(() => this.store.isLoading());
  readonly error = computed(() => this.store.error());
  readonly isSuccess = computed(() => this.store.isSuccess());
  readonly isFormValid = computed(() => this.store.isFormValid());
  readonly districtName = computed(() => this.store.districtName());

  readonly driverStatuses = Object.values(DriverStatusEnum);

  ngOnInit(): void {
    this.initializeForm();
    this.syncFormWithStore();
  }

  ngOnDestroy(): void {
    this.store.resetForm();
  }

  private initializeForm(): void {
    this.driverForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      documentNumber: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(12)]],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^\+519\d{8}$/)]],
      emailAddress: ['', [Validators.required, Validators.email]],
      licenseNumber: ['', [Validators.required, Validators.pattern(/^[A-Za-z0-9]{8}$/)]],
      licenseExpiryDate: ['', Validators.required],
      status: [DriverStatusEnum.AVAILABLE, Validators.required],
      assignedVehicleId: ['']
    });
  }

  private syncFormWithStore(): void {
    this.driverForm.valueChanges.subscribe(formValue => {
      this.store.updateFormData(formValue);
    });
  }

  // Helper method for field validation
  private isFieldValid(fieldName: string): boolean {
    return this.driverForm.get(fieldName)?.valid === true;
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
      case 0: // Información Personal
        return this.isFieldValid('firstName') &&
          this.isFieldValid('lastName') &&
          this.isFieldValid('documentNumber') &&
          this.isFieldValid('phoneNumber') &&
          this.isFieldValid('emailAddress');

      case 1: // Licencia de Conducir
        return this.isFieldValid('licenseNumber') &&
          this.isFieldValid('licenseExpiryDate');

      case 2: // Estado y Asignación (optional)
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
      this.store.createDriver();
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
      licenseNumber: '',
      licenseExpiryDate: '',
      status: DriverStatusEnum.AVAILABLE,
      assignedVehicleId: ''
    });
    this.store.resetForm();
    this.expandedSection.set(0);
  }

  // Helper Methods
  isFieldInvalid(fieldName: string): boolean {
    const field = this.driverForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getFieldError(fieldName: string): string {
    const field = this.driverForm.get(fieldName);
    if (field && field.errors && field.touched) {
      if (field.errors['required']) return 'Este campo es requerido';
      if (field.errors['minlength']) return `Mínimo ${field.errors['minlength'].requiredLength} caracteres`;
      if (field.errors['maxlength']) return `Máximo ${field.errors['maxlength'].requiredLength} caracteres`;
      if (field.errors['email']) return 'Formato de email inválido';
      if (field.errors['pattern']) {
        if (fieldName === 'licenseNumber') return 'Debe contener 8 letras o números';
        if (fieldName === 'phoneNumber') return 'Formato inválido: +519XXXXXXXX';
        return 'Formato inválido';
      }
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
