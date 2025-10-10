import { Component, OnInit, OnDestroy, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DriversStore } from '../../model/store/drivers.store';
import {DistrictContextStore} from '../../../../../shared/stores/district-context.store';
import {DriverEntity, DriverStatusEnum} from '../../../../../entities';

@Component({
  selector: 'app-drivers',
  imports: [CommonModule, FormsModule],
  templateUrl: './drivers.page.html',
  styleUrl: './drivers.page.css'
})
export class DriversPage implements OnInit, OnDestroy {
  readonly store = inject(DriversStore);
  readonly districtContextStore = inject(DistrictContextStore);

  // Search and filter signals
  searchTerm = signal('');
  selectedStatus = signal<DriverStatusEnum | null>(null);
  showAssignedOnly = signal(false);

  // Computed signals for template
  readonly drivers = computed(() => this.store.filteredDrivers());
  readonly isLoading = computed(() => this.store.isLoading());
  readonly error = computed(() => this.store.error());
  readonly totalDrivers = computed(() => this.store.totalDrivers());
  readonly availableDrivers = computed(() => this.store.availableDrivers());
  readonly driversByStatus = computed(() => this.store.driversByStatus());
  readonly totalHoursWorked = computed(() => this.store.totalHoursWorked());
  readonly averageHoursPerDriver = computed(() => this.store.averageHoursPerDriver());
  readonly driversWithExpiredLicense = computed(() => this.store.driversWithExpiredLicense());
  readonly districtName = computed(() => this.store.districtName());

  // Status options
  readonly driverStatuses = Object.values(DriverStatusEnum);

  ngOnInit(): void {
    this.initializePage().then(() => {});
  }

  ngOnDestroy(): void {
    // Reset store state when leaving the page
    this.store.resetState();
  }

  private async initializePage(): Promise<void> {
    // Wait for district context to be available
    if (!this.districtContextStore.isDistrictLoaded()) {
      // If district is not loaded, try to initialize it
      try {
        await this.districtContextStore.initializeDistrictContext();
      } catch (error) {
        console.error('Error initializing district context:', error);
      }
    }

    // Load drivers once district context is available
    if (this.districtContextStore.districtId()) {
      await this.store.loadDrivers();
    }

    // Initialize filter signals from store
    this.searchTerm.set(this.store.searchTerm());
    this.selectedStatus.set(this.store.selectedStatus());
    this.showAssignedOnly.set(this.store.showAssignedOnly());
  }

  // Search and filter methods
  onSearchTermChange(searchTerm: string): void {
    this.searchTerm.set(searchTerm);
    this.store.setSearchTerm(searchTerm);
  }

  onStatusFilterChange(status: string): void {
    const statusEnum = status === 'all' ? null : status as DriverStatusEnum;
    this.selectedStatus.set(statusEnum);
    this.store.setStatusFilter(statusEnum);
  }

  onAssignedFilterChange(showAssignedOnly: boolean): void {
    this.showAssignedOnly.set(showAssignedOnly);
    this.store.setShowAssignedOnly(showAssignedOnly);
  }

  clearFilters(): void {
    this.searchTerm.set('');
    this.selectedStatus.set(null);
    this.showAssignedOnly.set(false);
    this.store.clearFilters();
  }

  // Driver management methods
  async refreshDrivers(): Promise<void> {
    await this.store.refreshDrivers();
  }

  // Helper methods for template
  getStatusLabel(status: DriverStatusEnum): string {
    const labels = {
      [DriverStatusEnum.AVAILABLE]: 'Disponible',
      [DriverStatusEnum.ON_ROUTE]: 'En Ruta',
      [DriverStatusEnum.OFF_DUTY]: 'Fuera de Servicio',
      [DriverStatusEnum.SUSPENDED]: 'Suspendido'
    };
    return labels[status] || status;
  }

  getStatusClass(status: DriverStatusEnum): string {
    const classes = {
      [DriverStatusEnum.AVAILABLE]: 'status-available',
      [DriverStatusEnum.ON_ROUTE]: 'status-on-route',
      [DriverStatusEnum.OFF_DUTY]: 'status-off-duty',
      [DriverStatusEnum.SUSPENDED]: 'status-suspended'
    };
    return classes[status] || 'status-default';
  }

  getStatusIcon(status: DriverStatusEnum): string {
    const icons = {
      [DriverStatusEnum.AVAILABLE]: 'pi pi-check-circle',
      [DriverStatusEnum.ON_ROUTE]: 'pi pi-truck',
      [DriverStatusEnum.OFF_DUTY]: 'pi pi-pause-circle',
      [DriverStatusEnum.SUSPENDED]: 'pi pi-exclamation-triangle'
    };
    return icons[status] || 'pi pi-user';
  }

  formatDate(date: Date | null): string {
    if (!date) return 'No disponible';
    return new Intl.DateTimeFormat('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(new Date(date));
  }

  formatNumber(value: number): string {
    return new Intl.NumberFormat('es-PE').format(value);
  }

  hasExpiredLicense(driver: DriverEntity): boolean {
    return driver.licenseExpiryDate <= new Date();
  }

  getLicenseStatusClass(driver: DriverEntity): string {
    return this.hasExpiredLicense(driver) ? 'license-expired' : 'license-valid';
  }

  getLicenseStatusText(driver: DriverEntity): string {
    return this.hasExpiredLicense(driver) ? 'Vencida' : 'Válida';
  }
}
