import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { CreateRouteStore } from '../../model/store/create-route.store';

@Component({
  selector: 'app-create-route',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    SelectModule,
    InputTextModule,
    ButtonModule,
  ],
  providers: [
    CreateRouteStore
  ],
  templateUrl: './create-route.page.html',
})
export class CreateRoutePage implements OnInit {

  readonly store = inject(CreateRouteStore);
  private readonly fb = inject(FormBuilder);

  routeForm!: FormGroup;
  today = new Date().toISOString().split('T')[0];

  ngOnInit(): void {
    this.initForm();
    this.store.loadAvailableOptions();
  }

  private initForm() {
    // Inicializa con los valores del store
    const formData = this.store.formData();

    this.routeForm = this.fb.group({
      driverId: [formData.driverId || '', Validators.required],
      vehicleId: [formData.vehicleId || '', Validators.required],
      scheduledDate: [formData.scheduledDate || '', Validators.required],
      scheduledStartTime: [formData.scheduledStartTime || '', Validators.required],
    });

    // Sincroniza cambios con el store
    this.routeForm.valueChanges.subscribe(value => {
      this.store.updateFormData(value);
    });
  }

  isFieldInvalid(field: string): boolean {
    const control = this.routeForm.get(field);
    return !!(control && control.invalid && (control.touched || control.dirty));
  }

  onSubmit(): void {
    if (this.routeForm.invalid) {
      this.routeForm.markAllAsTouched();
      return;
    }

    this.store.createRoute();
  }
}
