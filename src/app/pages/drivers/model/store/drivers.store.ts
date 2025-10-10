import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { computed, inject } from '@angular/core';
import { DriverService } from '../../../../../entities';
import { DriverEntity, DriverStatusEnum } from '../../../../../entities';
import { DistrictContextStore } from '../../../../../shared/stores/district-context.store';

export interface DriversState {
  // Data
  drivers: DriverEntity[];
  filteredDrivers: DriverEntity[];

  // UI State
  isLoading: boolean;
  error: string | null;

  // Filters
  searchTerm: string;
  selectedStatus: DriverStatusEnum | null;
  showAssignedOnly: boolean;
}

const initialState: DriversState = {
  drivers: [],
  filteredDrivers: [],
  isLoading: false,
  error: null,
  searchTerm: '',
  selectedStatus: null,
  showAssignedOnly: false
};

export const DriversStore = signalStore(
  { providedIn: 'root' },

  // State
  withState(initialState),

  // Computed properties
  withComputed((state) => {
    const districtContextStore = inject(DistrictContextStore);

    return {
      // Basic computed
      totalDrivers: computed(() => state.drivers().length),
      availableDrivers: computed(() =>
        state.drivers().filter(driver => driver.status === DriverStatusEnum.AVAILABLE)
      ),
      onRouteDrivers: computed(() =>
        state.drivers().filter(driver => driver.status === DriverStatusEnum.ON_ROUTE)
      ),
      offDutyDrivers: computed(() =>
        state.drivers().filter(driver => driver.status === DriverStatusEnum.OFF_DUTY)
      ),
      suspendedDrivers: computed(() =>
        state.drivers().filter(driver => driver.status === DriverStatusEnum.SUSPENDED)
      ),

      // Statistics
      driversByStatus: computed(() => {
        const drivers = state.drivers();
        return Object.values(DriverStatusEnum).map(status => ({
          status,
          count: drivers.filter(d => d.status === status).length,
          label: getStatusLabel(status)
        }));
      }),

      totalHoursWorked: computed(() => {
        return state.drivers()
          .reduce((total, driver) => total + driver.totalHoursWorked, 0);
      }),

      averageHoursPerDriver: computed(() => {
        const drivers = state.drivers();
        if (drivers.length === 0) return 0;
        const totalHours = state.drivers().reduce((total, driver) => total + driver.totalHoursWorked, 0);
        return totalHours / drivers.length;
      }),

      // Drivers with expired licenses
      driversWithExpiredLicense: computed(() => {
        const today = new Date();
        return state.drivers().filter(driver => {
          return driver.licenseExpiryDate <= today;
        });
      }),

      // District context
      districtId: computed(() => districtContextStore.districtId()),
      districtName: computed(() => districtContextStore.districtName()),
      isDistrictLoaded: computed(() => districtContextStore.isDistrictLoaded()),

      // Filtered drivers (client-side filtering for better UX)
      filteredDrivers: computed(() => {
        let filtered = state.drivers();

        // Filter by status
        if (state.selectedStatus()) {
          filtered = filtered.filter(driver => driver.status === state.selectedStatus());
        }

        // Filter by assignment
        if (state.showAssignedOnly()) {
          filtered = filtered.filter(driver => driver.assignedVehicleId !== null);
        }

        // Filter by search term
        if (state.searchTerm()) {
          const searchTerm = state.searchTerm().toLowerCase();
          filtered = filtered.filter(driver =>
            driver.firstName.toLowerCase().includes(searchTerm) ||
            driver.lastName.toLowerCase().includes(searchTerm) ||
            driver.documentNumber.toLowerCase().includes(searchTerm) ||
            driver.phoneNumber.toLowerCase().includes(searchTerm) ||
            driver.emailAddress.toLowerCase().includes(searchTerm) ||
            (driver.assignedVehicleId && driver.assignedVehicleId.toLowerCase().includes(searchTerm))
          );
        }

        return filtered;
      }),

      // Loading states
      hasDrivers: computed(() => state.drivers().length > 0),
      hasFilteredResults: computed(() => state.filteredDrivers().length > 0),
      isEmpty: computed(() => !state.isLoading() && state.drivers().length === 0)
    };
  }),

  // Methods
  withMethods((store) => {
    const driverService = inject(DriverService);
    const districtContextStore = inject(DistrictContextStore);

    return {
      // Load drivers from API
      async loadDrivers(): Promise<void> {
        const districtId = districtContextStore.districtId();

        if (!districtId) {
          patchState(store, {
            error: 'No se pudo obtener el ID del distrito. Verifique que el contexto esté disponible.'
          });
          return;
        }

        patchState(store, {
          isLoading: true,
          error: null
        });

        try {
          const drivers = await driverService.getAllByDistrictId(districtId).toPromise();

          patchState(store, {
            drivers: drivers || [],
            isLoading: false
          });
        } catch (error: any) {
          patchState(store, {
            isLoading: false,
            error: error.message || 'Error al cargar los conductores',
            drivers: []
          });
        }
      },

      // Refresh drivers data
      async refreshDrivers(): Promise<void> {
        await this.loadDrivers();
      },

      // Filter methods
      setSearchTerm(searchTerm: string): void {
        patchState(store, { searchTerm });
      },

      setStatusFilter(status: DriverStatusEnum | null): void {
        patchState(store, { selectedStatus: status });
      },

      setShowAssignedOnly(showAssignedOnly: boolean): void {
        patchState(store, { showAssignedOnly });
      },

      // Clear all filters
      clearFilters(): void {
        patchState(store, {
          searchTerm: '',
          selectedStatus: null,
          showAssignedOnly: false
        });
      },

      // Driver management
      addDriver(driver: DriverEntity): void {
        patchState(store, (state) => ({
          drivers: [...state.drivers, driver]
        }));
      },

      updateDriver(id: string, updates: Partial<DriverEntity>): void {
        patchState(store, (state) => ({
          drivers: state.drivers.map(driver =>
            driver.id === id ? { ...driver, ...updates } : driver
          )
        }));
      },

      removeDriver(id: string): void {
        patchState(store, (state) => ({
          drivers: state.drivers.filter(driver => driver.id !== id)
        }));
      },

      // Utility methods
      setError(error: string | null): void {
        patchState(store, { error });
      },

      setLoading(loading: boolean): void {
        patchState(store, { isLoading: loading });
      },

      resetState(): void {
        patchState(store, initialState);
      },

      // Get driver by ID
      getDriverById(id: string): DriverEntity | undefined {
        return store.drivers().find(driver => driver.id === id);
      },

      // Get drivers by status
      getDriversByStatus(status: DriverStatusEnum): DriverEntity[] {
        return store.drivers().filter(driver => driver.status === status);
      },

      // Get available drivers (not suspended)
      getAvailableDrivers(): DriverEntity[] {
        return store.drivers().filter(driver => driver.status !== DriverStatusEnum.SUSPENDED);
      }
    };
  })
);

// Helper function for status labels
function getStatusLabel(status: DriverStatusEnum): string {
  const labels = {
    [DriverStatusEnum.AVAILABLE]: 'Disponible',
    [DriverStatusEnum.ON_ROUTE]: 'En Ruta',
    [DriverStatusEnum.OFF_DUTY]: 'Fuera de Servicio',
    [DriverStatusEnum.SUSPENDED]: 'Suspendido'
  };
  return labels[status] || status;
}
