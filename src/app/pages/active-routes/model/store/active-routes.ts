import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { computed, inject } from '@angular/core';
import { DistrictContextStore } from '../../../../../shared/stores/district-context.store';
import {RouteService} from '../../../../../entities/route/api';
import {firstValueFrom} from 'rxjs';
import {RouteEntity, RouteStatusEnum, RouteTypeEnum} from '../../../../../entities/route/model';

export interface ActiveRoutesState {
  // Data
  routes: RouteEntity[];
  filteredRoutes: RouteEntity[];

  // UI State
  isLoading: boolean;
  error: string | null;

  // Filters
  searchTerm: string;
  selectedStatus: RouteStatusEnum | null;
  selectedType: RouteTypeEnum | null;
  showInProgressOnly: boolean;
}

const initialState: ActiveRoutesState = {
  routes: [],
  filteredRoutes: [],
  isLoading: false,
  error: null,
  searchTerm: '',
  selectedStatus: null,
  selectedType: null,
  showInProgressOnly: true
};

export const ActiveRoutesStore = signalStore(
  { providedIn: 'root' },

  // State
  withState(initialState),

  // Computed properties
  withComputed((state) => {
    const districtContextStore = inject(DistrictContextStore);

    return {
      // Basic computed
      totalRoutes: computed(() => state.routes().length),
      inProgressRoutes: computed(() =>
        state.routes().filter(route => route.status === RouteStatusEnum.IN_PROGRESS)
      ),
      completedRoutes: computed(() =>
        state.routes().filter(route => route.status === RouteStatusEnum.COMPLETED)
      ),
      assignedRoutes: computed(() =>
        state.routes().filter(route => route.status === RouteStatusEnum.ASSIGNED)
      ),
      draftRoutes: computed(() =>
        state.routes().filter(route => route.status === RouteStatusEnum.DRAFT)
      ),

      // Statistics
      routesByStatus: computed(() => {
        const routes = state.routes();
        return Object.values(RouteStatusEnum).map(status => ({
          status,
          count: routes.filter(r => r.status === status).length,
          label: getStatusLabel(status)
        }));
      }),

      routesByType: computed(() => {
        const routes = state.routes();
        return Object.values(RouteTypeEnum).map(type => ({
          type,
          count: routes.filter(r => r.routeType === type).length,
          label: getTypeLabel(type)
        }));
      }),

      totalDistance: computed(() => {
        return state.routes()
          .filter(r => r.totalDistance !== null)
          .reduce((total, route) => total + (route.totalDistance || 0), 0);
      }),

      totalEstimatedDuration: computed(() => {
        return state.routes()
          .filter(r => r.estimatedDuration !== null)
          .reduce((total, route) => total + (route.estimatedDuration || 0), 0);
      }),

      // Routes with waypoints count
      routesWithWaypoints: computed(() => {
        return state.routes().filter(route => route.waypoints.length > 0);
      }),

      // Average waypoints per route
      averageWaypointsPerRoute: computed(() => {
        const routes = state.routes();
        if (routes.length === 0) return 0;
        const totalWaypoints = routes.reduce((total, route) => total + route.waypoints.length, 0);
        return Math.round(totalWaypoints / routes.length);
      }),

      // District context
      districtId: computed(() => districtContextStore.districtId()),
      districtName: computed(() => districtContextStore.districtName()),
      isDistrictLoaded: computed(() => districtContextStore.isDistrictLoaded()),

      // Filtered routes (client-side filtering for better UX)
      filteredRoutes: computed(() => {
        let filtered = state.routes();

        // Filter by status
        if (state.selectedStatus()) {
          filtered = filtered.filter(route => route.status === state.selectedStatus());
        }

        // Filter by type
        if (state.selectedType()) {
          filtered = filtered.filter(route => route.routeType === state.selectedType());
        }

        // Filter to show only in-progress routes
        if (state.showInProgressOnly()) {
          filtered = filtered.filter(route => route.status === RouteStatusEnum.IN_PROGRESS);
        }

        // Filter by search term
        if (state.searchTerm()) {
          const searchTerm = state.searchTerm().toLowerCase();
          filtered = filtered.filter(route =>
            route.id.toLowerCase().includes(searchTerm) ||
            (route.vehicleId && route.vehicleId.toLowerCase().includes(searchTerm)) ||
            (route.driverId && route.driverId.toLowerCase().includes(searchTerm))
          );
        }

        return filtered;
      }),

      // Loading states
      hasRoutes: computed(() => state.routes().length > 0),
      hasFilteredResults: computed(() => state.filteredRoutes().length > 0),
      isEmpty: computed(() => !state.isLoading() && state.routes().length === 0)
    };
  }),

  // Methods
  withMethods((store) => {
    const routeService = inject(RouteService);
    const districtContextStore = inject(DistrictContextStore);

    return {
      // Load active routes from API
      async loadActiveRoutes(): Promise<void> {
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
          const routes = await firstValueFrom(routeService.getAllActiveByDistrictId(districtId));

          patchState(store, {
            routes: routes || [],
            isLoading: false
          });
        } catch (error: any) {
          patchState(store, {
            isLoading: false,
            error: error.message || 'Error al cargar las rutas activas',
            routes: []
          });
        }
      },

      // Refresh routes data
      async refreshRoutes(): Promise<void> {
        await this.loadActiveRoutes();
      },

      // Filter methods
      setSearchTerm(searchTerm: string): void {
        patchState(store, { searchTerm });
      },

      setStatusFilter(status: RouteStatusEnum | null): void {
        patchState(store, { selectedStatus: status });
      },

      setTypeFilter(type: RouteTypeEnum | null): void {
        patchState(store, { selectedType: type });
      },

      setShowInProgressOnly(showInProgressOnly: boolean): void {
        patchState(store, { showInProgressOnly });
      },

      // Clear all filters
      clearFilters(): void {
        patchState(store, {
          searchTerm: '',
          selectedStatus: null,
          selectedType: null,
          showInProgressOnly: true
        });
      },

      // Route management
      addRoute(route: RouteEntity): void {
        patchState(store, (state) => ({
          routes: [...state.routes, route]
        }));
      },

      updateRoute(id: string, updates: Partial<RouteEntity>): void {
        patchState(store, (state) => ({
          routes: state.routes.map(route =>
            route.id === id ? { ...route, ...updates } : route
          )
        }));
      },

      removeRoute(id: string): void {
        patchState(store, (state) => ({
          routes: state.routes.filter(route => route.id !== id)
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

      // Get route by ID
      getRouteById(id: string): RouteEntity | undefined {
        return store.routes().find(route => route.id === id);
      },

      // Get routes by status
      getRoutesByStatus(status: RouteStatusEnum): RouteEntity[] {
        return store.routes().filter(route => route.status === status);
      },

      // Get routes by type
      getRoutesByType(type: RouteTypeEnum): RouteEntity[] {
        return store.routes().filter(route => route.routeType === type);
      },

      // Get routes with most waypoints
      getRoutesWithMostWaypoints(limit: number = 5): RouteEntity[] {
        return [...store.routes()]
          .sort((a, b) => b.waypoints.length - a.waypoints.length)
          .slice(0, limit);
      }
    };
  })
);

// Helper functions for labels
function getStatusLabel(status: RouteStatusEnum): string {
  const labels = {
    [RouteStatusEnum.DRAFT]: 'Borrador',
    [RouteStatusEnum.ASSIGNED]: 'Asignada',
    [RouteStatusEnum.IN_PROGRESS]: 'En Progreso',
    [RouteStatusEnum.COMPLETED]: 'Completada',
    [RouteStatusEnum.CANCELLED]: 'Cancelada'
  };
  return labels[status] || status;
}

function getTypeLabel(type: RouteTypeEnum): string {
  const labels = {
    [RouteTypeEnum.REGULAR]: 'Regular',
    [RouteTypeEnum.EMERGENCY]: 'Emergencia',
    [RouteTypeEnum.OPTIMIZED]: 'Optimizada'
  };
  return labels[type] || type;
}
