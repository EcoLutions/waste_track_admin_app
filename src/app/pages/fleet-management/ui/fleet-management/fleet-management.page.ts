import { Component, OnInit, OnDestroy, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FleetManagementStore } from '../../model/store/fleet-management.store';
import { DistrictContextStore } from '../../../../../shared/stores/district-context.store';
import { VehicleEntity, VehicleTypeEnum } from '../../../../../entities';

@Component({
  selector: 'app-fleet-management',
  imports: [CommonModule, FormsModule],
  templateUrl: './fleet-management.page.html',
  styleUrl: './fleet-management.page.css'
})
export class FleetManagementPage implements OnInit, OnDestroy {
  readonly store = inject(FleetManagementStore);
  readonly districtContextStore = inject(DistrictContextStore);

  // Selected vehicle for detail panel
  selectedVehicle = signal<VehicleEntity | null>(null);

  // Search and filter signals
  searchTerm = signal('');
  selectedVehicleType = signal<VehicleTypeEnum | null>(null);
  showOnlyActive = signal(true);

  // Computed signals for template
  readonly vehicles = computed(() => this.store.filteredVehicles());
  readonly isLoading = computed(() => this.store.isLoading());
  readonly error = computed(() => this.store.error());
  readonly totalVehicles = computed(() => this.store.totalVehicles());
  readonly activeVehicles = computed(() => this.store.activeVehicles());
  readonly vehiclesByType = computed(() => this.store.vehiclesByType());
  readonly totalCapacity = computed(() => this.store.totalCapacity());
  readonly averageMileage = computed(() => this.store.averageMileage());
  readonly vehiclesNeedingMaintenance = computed(() => this.store.vehiclesNeedingMaintenance());
  readonly districtName = computed(() => this.store.districtName());

  // Vehicle type options
  readonly vehicleTypes = Object.values(VehicleTypeEnum);

  // Check if there are active filters
  readonly hasActiveFilters = computed(() => {
    return this.searchTerm() !== '' ||
      this.selectedVehicleType() !== null ||
      !this.showOnlyActive();
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
      await this.store.loadVehicles();
    }

    this.searchTerm.set(this.store.searchTerm());
    this.selectedVehicleType.set(this.store.selectedVehicleType());
    this.showOnlyActive.set(this.store.showOnlyActive());
  }

  // Search and filter methods
  onSearchTermChange(searchTerm: string): void {
    this.searchTerm.set(searchTerm);
    this.store.setSearchTerm(searchTerm);
  }

  onVehicleTypeFilterChange(vehicleType: string): void {
    const type = vehicleType === 'all' ? null : vehicleType as VehicleTypeEnum;
    this.selectedVehicleType.set(type);
    this.store.setVehicleTypeFilter(type);
  }

  onActiveFilterChange(showOnlyActive: boolean): void {
    this.showOnlyActive.set(showOnlyActive);
    this.store.setShowOnlyActive(showOnlyActive);
  }

  toggleActiveFilter(): void {
    const newValue = !this.showOnlyActive();
    this.showOnlyActive.set(newValue);
    this.store.setShowOnlyActive(newValue);
  }

  clearFilters(): void {
    this.searchTerm.set('');
    this.selectedVehicleType.set(null);
    this.showOnlyActive.set(true);
    this.store.clearFilters();
  }

  // Vehicle management methods
  async refreshVehicles(): Promise<void> {
    await this.store.refreshVehicles();
  }

  // Vehicle selection for detail panel
  selectVehicle(vehicle: VehicleEntity): void {
    // Toggle: if clicking the same vehicle, close the panel
    if (this.selectedVehicle()?.id === vehicle.id) {
      this.selectedVehicle.set(null);
    } else {
      this.selectedVehicle.set(vehicle);
    }
  }

  closeVehicleDetail(): void {
    this.selectedVehicle.set(null);
  }

  // Helper methods for template
  getVehicleTypeLabel(type: VehicleTypeEnum): string {
    const labels = {
      [VehicleTypeEnum.COMPACTOR]: 'Compactador',
      [VehicleTypeEnum.TRUCK]: 'Camión',
      [VehicleTypeEnum.MINI_TRUCK]: 'Mini Camión'
    };
    return labels[type] || type;
  }

  getVehicleTypeIcon(type: VehicleTypeEnum): string {
    const icons = {
      [VehicleTypeEnum.COMPACTOR]: 'pi pi-box',
      [VehicleTypeEnum.TRUCK]: 'pi pi-truck',
      [VehicleTypeEnum.MINI_TRUCK]: 'pi pi-car'
    };
    return icons[type] || 'pi pi-truck';
  }

  getVehicleStatusClass(vehicle: VehicleEntity): string {
    if (!vehicle.isActive) {
      return 'inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700';
    }

    if (vehicle.nextMaintenanceDate) {
      const today = new Date();
      const maintenanceDate = new Date(vehicle.nextMaintenanceDate);

      if (maintenanceDate <= today) {
        return 'inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-red-100 text-red-700';
      }

      const sevenDaysFromNow = new Date();
      sevenDaysFromNow.setDate(today.getDate() + 7);

      if (maintenanceDate <= sevenDaysFromNow) {
        return 'inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-orange-100 text-orange-700';
      }
    }

    return 'inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-green-100 text-green-700';
  }

  getVehicleStatusText(vehicle: VehicleEntity): string {
    if (!vehicle.isActive) return 'Inactivo';

    if (vehicle.nextMaintenanceDate) {
      const today = new Date();
      const maintenanceDate = new Date(vehicle.nextMaintenanceDate);

      if (maintenanceDate <= today) {
        return 'Mantenimiento Vencido';
      }

      const sevenDaysFromNow = new Date();
      sevenDaysFromNow.setDate(today.getDate() + 7);

      if (maintenanceDate <= sevenDaysFromNow) {
        return 'Mantenimiento Próximo';
      }
    }

    return 'Activo';
  }

  needsMaintenanceSoon(vehicle: VehicleEntity): boolean {
    if (!vehicle.nextMaintenanceDate || !vehicle.isActive) return false;

    const today = new Date();
    const maintenanceDate = new Date(vehicle.nextMaintenanceDate);
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(today.getDate() + 7);

    return maintenanceDate <= sevenDaysFromNow;
  }

  formatDate(date: Date | null): string {
    if (!date) return 'No programado';
    return new Intl.DateTimeFormat('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(new Date(date));
  }

  formatNumber(value: number): string {
    return new Intl.NumberFormat('es-PE').format(value);
  }
}
