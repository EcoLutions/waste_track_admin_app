import {Component, EventEmitter, computed, inject, signal, OnInit, OnDestroy} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ManageReportsStore } from '../../model/store/manage-reports.store';

import {ReportTypeEnum, ReportStatusEnum} from '../../../../entities';
import {ActivatedRoute, Router} from '@angular/router';

@Component({
  selector: 'app-manage-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './manage-reports.page.html',
  styleUrl: './manage-reports.page.css',
  providers: [ManageReportsStore]
})
export class ManageReportsPage implements OnInit, OnDestroy{
  readonly store = inject(ManageReportsStore);
  constructor(private route: ActivatedRoute, private router: Router) {}

  resolutionNote = signal('');
  isEditable = signal(true);


  readonly currentReport = computed(() => this.store.currentReport());
  readonly evidences = computed(() => this.store.evidences());
  readonly isLoadingEvidences = computed(() => this.store.isLoadingEvidences());
  readonly isSaving = computed(() => this.store.isSaving());
  readonly error = computed(() => this.store.error());
  readonly hasEvidences = computed(() => this.store.hasEvidences());


  ngOnInit(): void {
    this.initializePage().then(() => {});
  }

  ngOnDestroy(): void {
    this.store.resetState();
  }


  private async initializePage(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      await this.store.setReport(id);
    } else {
      this.store.setReport('');
    }

    const value = this.currentReport();

    this.resolutionNote.set(value?.resolutionNote ?? '');
    this.isEditable.set(value?.status !== ReportStatusEnum.RESOLVED);

  }

  onClose(): void {
    this.router.navigate(['/citizen-reports']);
  }

  async onResolveReport(): Promise<void> {
    if (!this.resolutionNote().trim()) {
      alert('Por favor, añade una nota de resolución antes de finalizar.');
      return;
    }

    const success = await this.store.saveResolution(
      ReportStatusEnum.RESOLVED,
      this.resolutionNote()
    );

    if (success) {
      this.onClose();
    }
  }


  async onRejectReport(): Promise<void> {
    if (!this.resolutionNote().trim()) {
      alert('Por favor, indica el motivo del rechazo en la nota.');
      return;
    }

    const success = await this.store.saveResolution(
      ReportStatusEnum.REJECTED,
      this.resolutionNote()
    );

    if (success) {
      this.onClose();
    }
  }

  formatDate(date: Date | null | undefined): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('es-PE', {
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  }

  getTypeLabel(type: ReportTypeEnum): string {
    const labels: Record<string, string> = {
      [ReportTypeEnum.CONTAINER_FULL]: 'Contenedor Lleno',
      [ReportTypeEnum.CONTAINER_DAMAGED]: 'Contenedor Dañado',
      [ReportTypeEnum.GARBAGE_OUTSIDE]: 'Basura Fuera',
      [ReportTypeEnum.MISSED_COLLECTION]: 'No Recogido',
      [ReportTypeEnum.OTHER]: 'Otro'
    };
    return labels[type] || type;
  }

  getStatusLabel(status: ReportStatusEnum): string {
    const labels: Record<string, string> = {
      [ReportStatusEnum.SUBMITTED]: 'Enviado',
      [ReportStatusEnum.ACKNOWLEDGED]: 'Recibido',
      [ReportStatusEnum.IN_PROGRESS]: 'En Proceso',
      [ReportStatusEnum.RESOLVED]: 'Resuelto',
      [ReportStatusEnum.REJECTED]: 'Rechazado'
    };
    return labels[status] || status;
  }

  getStatusClass(status: ReportStatusEnum): string {
    const base = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';
    switch (status) {
      case ReportStatusEnum.SUBMITTED: return `${base} bg-blue-100 text-blue-800`;
      case ReportStatusEnum.ACKNOWLEDGED: return `${base} bg-purple-100 text-purple-800`;
      case ReportStatusEnum.IN_PROGRESS: return `${base} bg-yellow-100 text-yellow-800`;
      case ReportStatusEnum.RESOLVED: return `${base} bg-green-100 text-green-800`;
      case ReportStatusEnum.REJECTED: return `${base} bg-red-100 text-red-800`;
      default: return `${base} bg-gray-100 text-gray-800`;
    }
  }

  getTypeIcon(type: ReportTypeEnum): string {
    switch (type) {
      case ReportTypeEnum.CONTAINER_FULL: return 'pi pi-trash';
      case ReportTypeEnum.CONTAINER_DAMAGED: return 'pi pi-exclamation-triangle';
      case ReportTypeEnum.GARBAGE_OUTSIDE: return 'pi pi-map-marker';
      case ReportTypeEnum.MISSED_COLLECTION: return 'pi pi-clock';
      default: return 'pi pi-info-circle';
    }
  }
}
