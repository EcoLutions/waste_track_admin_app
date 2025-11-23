import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CitizenReportsStore } from '../../model/store/citizen-reports.store';
import { DistrictContextStore } from '../../../../shared/stores/district-context.store';
import { ReportEntity, ReportStatusEnum, ReportTypeEnum } from '../../../../entities';


@Component({
  selector: 'app-citizen-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './citizen-reports.page.html',
  styleUrl: './citizen-reports.page.css'
})
export class CitizenReportsPage implements OnInit, OnDestroy {
  readonly store = inject(CitizenReportsStore);
  readonly districtContextStore = inject(DistrictContextStore);

  // Estado local de UI (Selección)
  selectedReport = signal<ReportEntity | null>(null);

  // Señales locales para los inputs de filtros
  searchTerm = signal('');
  selectedStatus = signal<ReportStatusEnum | null>(null);
  selectedType = signal<ReportTypeEnum | null>(null);

  // Computados del Store para usar en el HTML
  readonly reports = computed(() => this.store.filteredReports());
  readonly isLoading = computed(() => this.store.isLoading());
  readonly error = computed(() => this.store.error());
  readonly totalReports = computed(() => this.store.totalReports());
  readonly pendingReportsCount = computed(() => this.store.pendingReportsCount());
  readonly resolvedReportsCount = computed(() => this.store.resolvedReportsCount());
  readonly districtName = computed(() => this.store.districtName());

  // Listas para los <select>
  readonly reportStatuses = Object.values(ReportStatusEnum);
  readonly reportTypes = Object.values(ReportTypeEnum);

  readonly hasActiveFilters = computed(() =>
    this.searchTerm() !== '' || this.selectedStatus() !== null || this.selectedType() !== null
  );

  ngOnInit(): void {
    this.initializePage();
  }

  ngOnDestroy(): void {
    this.store.clearFilters();
  }

  private async initializePage(): Promise<void> {
    // Asegurar contexto
    if (!this.districtContextStore.isDistrictLoaded()) {
      await this.districtContextStore.initializeDistrictContext().catch(console.error);
    }
    // Cargar datos
    await this.store.loadReports();
  }

  // --- Métodos de UI ---

  onSearchTermChange(term: string): void {
    this.searchTerm.set(term);
    this.store.setSearchTerm(term);
  }

  onStatusFilterChange(value: string): void {
    const status = value === 'all' ? null : value as ReportStatusEnum;
    this.selectedStatus.set(status);
    this.store.setStatusFilter(status);
  }

  onTypeFilterChange(value: string): void {
    const type = value === 'all' ? null : value as ReportTypeEnum;
    this.selectedType.set(type);
    this.store.setTypeFilter(type);
  }

  clearFilters(): void {
    this.searchTerm.set('');
    this.selectedStatus.set(null);
    this.selectedType.set(null);
    this.store.clearFilters();
  }

  async refreshReports(): Promise<void> {
    await this.store.refreshReports();
  }

  selectReport(report: ReportEntity): void {
    this.selectedReport.update(current => current?.id === report.id ? null : report);
  }

  closeReportDetail(): void {
    this.selectedReport.set(null);
  }

  // --- Helpers Visuales (Mapeo de Entidades) ---

  formatDate(date: Date | null): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('es-PE', {
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  }

  // Mapeo de Status Enum a Texto
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

  // Mapeo de Type Enum a Texto
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

  // Clases CSS para Badges según Status
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

  // Iconos según Tipo
  getTypeIcon(type: ReportTypeEnum): string {
    switch (type) {
      case ReportTypeEnum.CONTAINER_FULL: return 'pi pi-trash';
      case ReportTypeEnum.CONTAINER_DAMAGED: return 'pi pi-exclamation-triangle';
      case ReportTypeEnum.GARBAGE_OUTSIDE: return 'pi pi-map-marker'; // O map
      case ReportTypeEnum.MISSED_COLLECTION: return 'pi pi-clock';
      default: return 'pi pi-info-circle';
    }
  }
}


