import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { computed, inject } from '@angular/core';
import { ContainerService, VehicleService, DriverService, RouteService, CitizenService } from '../../../../../entities';
import { ContainerEntity, VehicleEntity, DriverEntity, RouteEntity, CitizenEntity } from '../../../../../entities';
import { DistrictContextStore } from '../../../../../shared/stores/district-context.store';

export interface DashboardState {
  // Data from all services
  containers: ContainerEntity[];
  vehicles: VehicleEntity[];
  drivers: DriverEntity[];
  routes: RouteEntity[];
  citizens: CitizenEntity[];

  // UI State
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

const initialState: DashboardState = {
  containers: [],
  vehicles: [],
  drivers: [],
  routes: [],
  citizens: [],
  isLoading: false,
  error: null,
  lastUpdated: null
};

export const DashboardStore = signalStore(
  { providedIn: 'root' },

  // State
  withState(initialState),

  // Computed properties
  withComputed((state) => {
    const districtContextStore = inject(DistrictContextStore);

    return {
      // Basic counts
      totalContainers: computed(() => state.containers().length),
      totalVehicles: computed(() => state.vehicles().length),
      totalDrivers: computed(() => state.drivers().length),
      totalRoutes: computed(() => state.routes().length),
      totalCitizens: computed(() => state.citizens().length),

      // Container metrics
      activeContainers: computed(() =>
        state.containers().filter(container => container.status === 'ACTIVE')
      ),
      containersNeedingCollection: computed(() =>
        state.containers().filter(container => container.currentFillLevel > 80)
      ),
      containersWithAlerts: computed(() =>
        state.containers().filter(container => container.currentFillLevel > 90)
      ),

      // Vehicle metrics
      activeVehicles: computed(() =>
        state.vehicles().filter(vehicle => vehicle.isActive)
      ),
      vehiclesNeedingMaintenance: computed(() => {
        const today = new Date();
        return state.vehicles().filter(vehicle => {
          if (!vehicle.nextMaintenanceDate) return false;
          return vehicle.nextMaintenanceDate <= today;
        });
      }),

      // Driver metrics
      availableDrivers: computed(() =>
        state.drivers().filter(driver => driver.status === 'AVAILABLE')
      ),
      driversOnRoute: computed(() =>
        state.drivers().filter(driver => driver.status === 'ON_ROUTE')
      ),

      // Route metrics
      activeRoutes: computed(() =>
        state.routes().filter(route => route.status === 'IN_PROGRESS')
      ),
      completedRoutesToday: computed(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return state.routes().filter(route =>
          route.completedAt && route.completedAt >= today
        );
      }),

      // Citizen metrics
      activeCitizens: computed(() => {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return state.citizens().filter(citizen =>
          citizen.lastActivityDate >= thirtyDaysAgo
        );
      }),

      // District context
      districtId: computed(() => districtContextStore.districtId()),
      districtName: computed(() => districtContextStore.districtName()),
      isDistrictLoaded: computed(() => districtContextStore.isDistrictLoaded()),

      // Overall system health
      systemHealthScore: computed(() => {
        const containers = state.containers();
        const vehicles = state.vehicles();
        const drivers = state.drivers();

        if (containers.length === 0 && vehicles.length === 0 && drivers.length === 0) {
          return 0;
        }

        let score = 0;
        let total = 0;

        // Container health (30%)
        if (containers.length > 0) {
          const healthyContainers = containers.filter(c => c.currentFillLevel < 80).length;
          score += (healthyContainers / containers.length) * 30;
          total += 30;
        }

        // Vehicle health (25%)
        if (vehicles.length > 0) {
          const healthyVehicles = vehicles.filter(v => v.isActive).length;
          score += (healthyVehicles / vehicles.length) * 25;
          total += 25;
        }

        // Driver availability (25%)
        if (drivers.length > 0) {
          const availableDrivers = drivers.filter(d => d.status === 'AVAILABLE').length;
          score += (availableDrivers / drivers.length) * 25;
          total += 25;
        }

        // Route completion (20%)
        const routes = state.routes();
        if (routes.length > 0) {
          const completedRoutes = routes.filter(r => r.status === 'COMPLETED').length;
          score += (completedRoutes / routes.length) * 20;
          total += 20;
        }

        return total > 0 ? Math.round(score) : 0;
      }),

      // Loading states
      hasData: computed(() =>
        state.containers().length > 0 ||
        state.vehicles().length > 0 ||
        state.drivers().length > 0 ||
        state.routes().length > 0 ||
        state.citizens().length > 0
      ),
      isEmpty: computed(() => !state.isLoading() && !state.hasData())
    };
  }),

  // Methods
  withMethods((store) => {
    const containerService = inject(ContainerService);
    const vehicleService = inject(VehicleService);
    const driverService = inject(DriverService);
    const routeService = inject(RouteService);
    const citizenService = inject(CitizenService);
    const districtContextStore = inject(DistrictContextStore);

    return {
      // Load all dashboard data
      async loadDashboardData(): Promise<void> {
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
          // Load data from all services in parallel
          const [containers, vehicles, drivers, routes, citizens] = await Promise.all([
            containerService.getAllByDistrictId(districtId).toPromise().catch(() => []),
            vehicleService.getAllByDistrictId(districtId).toPromise().catch(() => []),
            driverService.getAllByDistrictId(districtId).toPromise().catch(() => []),
            routeService.getAllActiveByDistrictId(districtId).toPromise().catch(() => []),
            citizenService.getAllByDistrictId(districtId).toPromise().catch(() => [])
          ]);

          patchState(store, {
            containers: containers || [],
            vehicles: vehicles || [],
            drivers: drivers || [],
            routes: routes || [],
            citizens: citizens || [],
            isLoading: false,
            lastUpdated: new Date()
          });
        } catch (error: any) {
          patchState(store, {
            isLoading: false,
            error: error.message || 'Error al cargar los datos del dashboard',
            containers: [],
            vehicles: [],
            drivers: [],
            routes: [],
            citizens: []
          });
        }
      },

      // Refresh dashboard data
      async refreshDashboard(): Promise<void> {
        await store.loadDashboardData();
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

      // Get specific data by ID
      getContainerById(id: string): ContainerEntity | undefined {
        return store.containers().find(container => container.id === id);
      },

      getVehicleById(id: string): VehicleEntity | undefined {
        return store.vehicles().find(vehicle => vehicle.id === id);
      },

      getDriverById(id: string): DriverEntity | undefined {
        return store.drivers().find(driver => driver.id === id);
      },

      getRouteById(id: string): RouteEntity | undefined {
        return store.routes().find(route => route.id === id);
      },

      getCitizenById(id: string): CitizenEntity | undefined {
        return store.citizens().find(citizen => citizen.id === id);
      }
    };
  })
);
