import { Component, computed, inject, OnDestroy, OnInit, signal, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

import { CreateReportStore } from '../../model/store/create-report.store';
import { ReportTypeEnum } from '../../../../entities';

@Component({
  selector: 'app-create-report',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-report.page.html',
  styleUrl: './create-report.page.css',
  providers: [CreateReportStore]
})
export class CreateReportPage implements OnInit, OnDestroy {
  readonly store = inject(CreateReportStore);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  // Reference to file input for triggering click programmatically
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  // --- Computed Signals from Store ---

  // Form Data
  readonly latitude = computed(() => this.store.latitude());
  readonly longitude = computed(() => this.store.longitude());
  readonly containerId = computed(() => this.store.containerId());
  readonly reportType = computed(() => this.store.reportType());
  readonly description = computed(() => this.store.description());

  // UI State
  readonly locationStatus = computed(() => this.store.locationStatus());
  readonly isValid = computed(() => this.store.isValid());
  readonly isSubmitting = computed(() => this.store.isSubmitting());
  readonly error = computed(() => this.store.error());
  readonly success = computed(() => this.store.success());

  // Evidence State
  readonly evidences = computed(() => this.store.evidences());
  readonly uploadingFiles = computed(() => this.store.uploadingFiles());

  // --- Local State ---
  readonly reportTypes = Object.values(ReportTypeEnum);

  ngOnInit(): void {
    // Initialize map or load initial data if needed
    console.log('Create Report Page Initialized');
  }

  ngOnDestroy(): void {
    // Clean up store state when leaving the page
    this.store.reset();
  }

  // --- Map Interactions (Simulated) ---

  /**
   * Handles click on the map canvas (Ground/Street click).
   * In a real implementation, this event comes from the Google Maps component.
   */
  onMapClick(event: any): void {
    // TODO: Replace mock coordinates with event.latLng.lat() and event.latLng.lng()
    const lat = -12.0464;
    const lng = -77.0428;

    this.store.setCoordinates(lat, lng);
  }

  /**
   * Handles click on a specific Container marker.
   */
  onContainerClick(containerId: string): void {
    // TODO: Get coordinates from the container entity
    const lat = -12.0450;
    const lng = -77.0410;

    this.store.setContainer(containerId, lat, lng);
  }

  // --- Form Actions ---

  onTypeChange(type: string): void {
    this.store.setType(type as ReportTypeEnum);
  }

  onDescriptionChange(text: string): void {
    this.store.setDescription(text);
  }

  // --- Evidence Management ---

  triggerFileInput(): void {
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.store.uploadEvidence(file);
      // Reset input to allow selecting the same file again if needed
      input.value = '';
    }
  }

  onRemoveEvidence(evidenceId: string): void {
    this.store.removeEvidence(evidenceId);
  }

  // --- Submission & Navigation ---

  async onSubmit(): Promise<void> {
    await this.store.submitReport();

    // If success is true (handled by store), the template will show the success view
    // Navigation back is handled in the success view button
  }

  onCancel(): void {
    this.router.navigate(['../'], { relativeTo: this.route });
  }

  // --- Helpers ---

  getTypeLabel(type: ReportTypeEnum): string {
    const labels: Record<string, string> = {
      [ReportTypeEnum.CONTAINER_FULL]: 'Contenedor Lleno',
      [ReportTypeEnum.CONTAINER_DAMAGED]: 'Contenedor Dañado',
      [ReportTypeEnum.GARBAGE_OUTSIDE]: 'Basura Fuera',
      [ReportTypeEnum.MISSED_COLLECTION]: 'Recolección Perdida',
      [ReportTypeEnum.OTHER]: 'Otro'
    };
    return labels[type] || type;
  }
}
