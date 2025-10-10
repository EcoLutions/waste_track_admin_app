import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { computed, inject } from '@angular/core';
import { VehicleService } from '../../../../../entities';
import { VehicleEntity, VehicleTypeEnum } from '../../../../../entities';
import { DistrictContextStore } from '../../../../../shared/stores/district-context.store';
import {firstValueFrom} from 'rxjs';

export interface FleetManagementState {
  // Data
  vehicles: VehicleEntity[];
  filteredVehicles: VehicleEntity[];

  // UI State
  isLoading: boolean;
  error: string | null;

  // Filters
  searchTerm: string;
  selectedVehicleType: VehicleTypeEnum | null;
  showOnlyActive: boolean;
}

const initialState: FleetManagementState = {
  vehicles: [],
  filteredVehicles: [],
  isLoading: false,
  error: null,
  searchTerm: '',
  selectedVehicleType: null,
  showOnlyActive: true
};

export const FleetManagementStore = signalStore(
  { providedIn: 'root' },

  // State
  withState(initialState),

  // Computed properties
  withComputed((state) => {
    const districtContextStore = inject(DistrictContextStore);

    return {
      // Basic computed
      totalVehicles: computed(() => state.vehicles().length),
      activeVehicles: computed(() =>
        state.vehicles().filter(vehicle => vehicle.isActive)
      ),
      inactiveVehicles: computed(() =>
        state.vehicles().filter(vehicle => !vehicle.isActive)
      ),

      // Statistics
      vehiclesByType: computed(() => {
        const vehicles = state.vehicles();
        return Object.values(VehicleTypeEnum).map(type => ({
          type,
          count: vehicles.filter(v => v.vehicleType === type).length,
          activeCount: vehicles.filter(v => v.vehicleType === type && v.isActive).length
        }));
      }),

      totalCapacity: computed(() => {
        return state.vehicles()
          .filter(v => v.isActive)
          .reduce((total, vehicle) => total + vehicle.volumeCapacity, 0);
      }),

      averageMileage: computed(() => {
        const vehicles = state.vehicles().filter(v => v.mileage > 0);
        if (vehicles.length === 0) return 0;
        return vehicles.reduce((sum, vehicle) => sum + vehicle.mileage, 0) / vehicles.length;
      }),

      // Maintenance alerts
      vehiclesNeedingMaintenance: computed(() => {
        const today = new Date();
        return state.vehicles().filter(vehicle => {
          if (!vehicle.nextMaintenanceDate) return false;
          return vehicle.nextMaintenanceDate <= today;
        });
      }),

      // District context
      districtId: computed(() => districtContextStore.districtId()),
      districtName: computed(() => districtContextStore.districtName()),
      isDistrictLoaded: computed(() => districtContextStore.isDistrictLoaded()),

      // Filtered vehicles (client-side filtering for better UX)
      filteredVehicles: computed(() => {
        let filtered = state.vehicles();

        // Filter by active status
        if (state.showOnlyActive()) {
          filtered = filtered.filter(vehicle => vehicle.isActive);
        }

        // Filter by vehicle type
        if (state.selectedVehicleType()) {
          filtered = filtered.filter(vehicle => vehicle.vehicleType === state.selectedVehicleType());
        }

        // Filter by search term
        if (state.searchTerm()) {
          const searchTerm = state.searchTerm().toLowerCase();
          filtered = filtered.filter(vehicle =>
            vehicle.licensePlate.toLowerCase().includes(searchTerm) ||
            vehicle.id.toLowerCase().includes(searchTerm) ||
            (vehicle.assignedDriverId && vehicle.assignedDriverId.toLowerCase().includes(searchTerm))
          );
        }

        return filtered;
      }),

      // Loading states
      hasVehicles: computed(() => state.vehicles().length > 0),
      hasFilteredResults: computed(() => state.filteredVehicles().length > 0),
      isEmpty: computed(() => !state.isLoading() && state.vehicles().length === 0)
    };
  }),

  // Methods
  withMethods((store) => {
    const vehicleService = inject(VehicleService);
    const districtContextStore = inject(DistrictContextStore);

    return {
      // Load vehicles from API
      async loadVehicles(): Promise<void> {
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
          const vehicles = await firstValueFrom(vehicleService.getAllByDistrictId(districtId));

          patchState(store, {
            vehicles: vehicles || [],
            isLoading: false
          });
        } catch (error: any) {
          patchState(store, {
            isLoading: false,
            error: error.message || 'Error al cargar los vehículos',
            vehicles: []
          });
        }
      },

      // Refresh vehicles data
      async refreshVehicles(): Promise<void> {
        await this.loadVehicles();
      },

      // Filter methods
      setSearchTerm(searchTerm: string): void {
        patchState(store, { searchTerm });
      },

      setVehicleTypeFilter(vehicleType: VehicleTypeEnum | null): void {
        patchState(store, { selectedVehicleType: vehicleType });
      },

      setShowOnlyActive(showOnlyActive: boolean): void {
        patchState(store, { showOnlyActive });
      },

      // Clear all filters
      clearFilters(): void {
        patchState(store, {
          searchTerm: '',
          selectedVehicleType: null,
          showOnlyActive: true
        });
      },

      // Vehicle management
      addVehicle(vehicle: VehicleEntity): void {
        patchState(store, (state) => ({
          vehicles: [...state.vehicles, vehicle]
        }));
      },

      updateVehicle(id: string, updates: Partial<VehicleEntity>): void {
        patchState(store, (state) => ({
          vehicles: state.vehicles.map(vehicle =>
            vehicle.id === id ? { ...vehicle, ...updates } : vehicle
          )
        }));
      },

      removeVehicle(id: string): void {
        patchState(store, (state) => ({
          vehicles: state.vehicles.filter(vehicle => vehicle.id !== id)
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

      // Get vehicle by ID
      getVehicleById(id: string): VehicleEntity | undefined {
        return store.vehicles().find(vehicle => vehicle.id === id);
      },

      // Get vehicles by type
      getVehiclesByType(vehicleType: VehicleTypeEnum): VehicleEntity[] {
        return store.vehicles().filter(vehicle => vehicle.vehicleType === vehicleType);
      },

      // Get active vehicles
      getActiveVehicles(): VehicleEntity[] {
        return store.vehicles().filter(vehicle => vehicle.isActive);
      }
    };
  })
);
