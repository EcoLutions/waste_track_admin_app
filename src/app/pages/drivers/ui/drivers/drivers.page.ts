import { Component, OnInit, OnDestroy, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DriversStore } from '../../model/store/drivers.store';
import { DistrictContextStore } from '../../../../../shared/stores/district-context.store';
import { DriverEntity, DriverStatusEnum } from '../../../../../entities';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'app-drivers',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './drivers.page.html',
  styleUrl: './drivers.page.css'
})
export class DriversPage implements OnInit, OnDestroy {
  readonly store = inject(DriversStore);
  readonly districtContextStore = inject(DistrictContextStore);

  // Selected driver for detail panel
  selectedDriver = signal<DriverEntity | null>(null);

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

  // Check if there are active filters
  readonly hasActiveFilters = computed(() => {
    return this.searchTerm() !== '' ||
      this.selectedStatus() !== null ||
      this.showAssignedOnly();
  });

  ngOnInit(): void {
    this.initializePage().then(() => {});
  }

  ngOnDestroy(): void {
    this.store.resetState();
  }

  private async initializePage(): Promise<void> {
    if (!this.districtContextStore.isDistrictLoaded()) {
      try {
        await this.districtContextStore.initializeDistrictContext();
      } catch (error) {
        console.error('Error initializing district context:', error);
      }
    }

    if (this.districtContextStore.districtId()) {
      await this.store.loadDrivers();
    }

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

  toggleAssignedFilter(): void {
    const newValue = !this.showAssignedOnly();
    this.showAssignedOnly.set(newValue);
    this.store.setShowAssignedOnly(newValue);
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

  // Driver selection for detail panel
  selectDriver(driver: DriverEntity): void {
    // Toggle: if clicking the same driver, close the panel
    if (this.selectedDriver()?.id === driver.id) {
      this.selectedDriver.set(null);
    } else {
      this.selectedDriver.set(driver);
    }
  }

  closeDriverDetail(): void {
    this.selectedDriver.set(null);
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
      [DriverStatusEnum.AVAILABLE]: 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-green-100 text-green-700',
      [DriverStatusEnum.ON_ROUTE]: 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-700',
      [DriverStatusEnum.OFF_DUTY]: 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700',
      [DriverStatusEnum.SUSPENDED]: 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-red-100 text-red-700'
    };
    return classes[status] || 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700';
  }

  getStatusIcon(status: DriverStatusEnum): string {
    const icons = {
      [DriverStatusEnum.AVAILABLE]: 'pi pi-check-circle',
      [DriverStatusEnum.ON_ROUTE]: 'pi pi-truck',
      [DriverStatusEnum.OFF_DUTY]: 'pi pi-pause-circle',
      [DriverStatusEnum.SUSPENDED]: 'pi pi-ban'
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
    const today = new Date();
    const expiryDate = new Date(driver.licenseExpiryDate);
    return expiryDate <= today;
  }

  getLicenseStatusClass(driver: DriverEntity): string {
    if (this.hasExpiredLicense(driver)) {
      return 'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700';
    }

    // Check if license expires soon (within 30 days)
    const today = new Date();
    const expiryDate = new Date(driver.licenseExpiryDate);
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);

    if (expiryDate <= thirtyDaysFromNow) {
      return 'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-700';
    }

    return 'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700';
  }

  getLicenseStatusText(driver: DriverEntity): string {
    if (this.hasExpiredLicense(driver)) {
      return 'Vencida';
    }

    // Check if license expires soon (within 30 days)
    const today = new Date();
    const expiryDate = new Date(driver.licenseExpiryDate);
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);

    if (expiryDate <= thirtyDaysFromNow) {
      return 'Por vencer';
    }

    return 'Válida';
  }
}
