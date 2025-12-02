import {patchState, signalStore, withComputed, withMethods, withState} from '@ngrx/signals';
import {computed, inject} from '@angular/core';
import {
  ContainerEntity,
  ContainerService,
  RouteEntity,
  RouteService,
  RouteStatusEnum,
  WaypointService,
  WaypointStatusEnum
} from '../../../../entities';
import {DistrictContextStore} from '../../../../shared/stores/district-context.store';
import {firstValueFrom} from 'rxjs';
import {EnumMapper} from '../../../../shared/api/mappers/enum.mapper';
import {GoogleDirectionsService, RouteDirections} from '../../../../shared/services/google-directions.service';
import {getStatusLabel} from '../../../../entities/route/model/enums/route-status.enum';

export interface ActiveRoutesState {
  routes: RouteEntity[];
  containers: ContainerEntity[];
  routeDirections: Map<string, RouteDirections>;

  isLoading: boolean;
  isLoadingDirections: boolean;
  error: string | null;

  selectedRouteId: string | null;
}

const initialState: ActiveRoutesState = {
  routes: [],
  containers: [],
  routeDirections: new Map(),
  isLoading: false,
  isLoadingDirections: false,
  error: null,
  selectedRouteId: null
};

export const ActiveRoutesStore = signalStore(

  withState(initialState),

  withComputed((state) => {
    const districtContextStore = inject(DistrictContextStore);

    return {
      totalRoutes: computed(() => state.routes().length),
      inProgressRoutes: computed(() =>
        state.routes().filter(route => route.status === RouteStatusEnum.IN_PROGRESS)
      ),
      completedRoutes: computed(() =>
        state.routes().filter(route => route.status === RouteStatusEnum.COMPLETED)
      ),
      assignedRoutes: computed(() =>
        state.routes().filter(route => route.status === RouteStatusEnum.ACTIVE)
      ),
      draftRoutes: computed(() =>
        state.routes().filter(route => route.status === RouteStatusEnum.PLANNED)
      ),

      routesByStatus: computed(() => {
        const routes = state.routes();
        return Object.values(RouteStatusEnum).map(status => ({
          status,
          count: routes.filter(r => r.status === status).length,
          label: getStatusLabel(status)
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

      routesWithWaypoints: computed(() => {
        return state.routes().filter(route => route.waypoints.length > 0);
      }),

      averageWaypointsPerRoute: computed(() => {
        const routes = state.routes();
        if (routes.length === 0) return 0;
        const totalWaypoints = routes.reduce((total, route) => total + route.waypoints.length, 0);
        return Math.round(totalWaypoints / routes.length);
      }),

      districtId: computed(() => districtContextStore.districtId()),
      districtName: computed(() => districtContextStore.districtName()),
      isDistrictLoaded: computed(() => districtContextStore.isDistrictLoaded()),

      filteredRoutes: computed(() => state.routes()),

      containersMap: computed(() => {
        const map = new Map<string, ContainerEntity>();
        state.containers().forEach(c => map.set(c.id, c));
        return map;
      }),

      getContainer: computed(() => (id: string) => {
        return state.containers().find(c => c.id === id);
      }),

      selectedRoute: computed(() => {
        const id = state.selectedRouteId();
        if (!id) return null;
        return state.routes().find(r => r.id === id) || null;
      }),

      getDirections: computed(() => (routeId: string) => {
        return state.routeDirections().get(routeId) || null;
      }),

    };
  }),

  withComputed((state) => ({
    hasRoutes: computed(() => state.routes().length > 0),
    hasFilteredResults: computed(() => state.filteredRoutes().length > 0),
    isEmpty: computed(() => !state.isLoading() && state.routes().length === 0),
    hasContainers: computed(() => state.containers().length > 0)
  })),

  withMethods((store) => {
    const routeService = inject(RouteService);
    const containerService = inject(ContainerService);
    const waypointService = inject(WaypointService);
    const directionsService = inject(GoogleDirectionsService);
    const districtContextStore = inject(DistrictContextStore);

    return {
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
          const [routes, containers] = await Promise.all([
            firstValueFrom(routeService.getAll({
              districtId: districtId,
              status: EnumMapper.mapEnumToString(RouteStatusEnum.IN_PROGRESS)
            })),
            firstValueFrom(containerService.getAllByDistrictId(districtId))
          ]);

          await this.loadWaypointsForRoutes(routes);

          console.log('✅ Waypoints cargados para todas las rutas');

          patchState(store, {
            routes: routes,
            containers: containers || [],
            isLoading: false
          });

          await this.loadAllDirections();

        } catch (error: any) {
          console.error('❌ Error al cargar rutas activas:', error);
          patchState(store, {
            isLoading: false,
            error: error.message || 'Error al cargar las rutas activas',
            routes: [],
            containers: []
          });
        }
      },

      async loadWaypointsForRoutes(routes: RouteEntity[]): Promise<void> {
        if (routes.length === 0) {
          console.log('⚠️ No hay rutas para cargar waypoints');
          return;
        }

        console.log(`🔍 Cargando waypoints para ${routes.length} rutas...`);

        await Promise.all(
          routes.map(async (route) => {
            try {
              const waypoints = await firstValueFrom(
                waypointService.getAllByRouteId(route.id)
              );

              route.waypoints = waypoints || [];
              route.totalWaypoints = route.waypoints.length;
              route.totalCompletedWaypoints = route.waypoints.filter(
                w => w.status === WaypointStatusEnum.VISITED
              ).length;
            } catch (error) {
              console.error(`  ❌ Error cargando waypoints para ruta ${route.id.substring(0, 8)}:`, error);
              route.waypoints = [];
              route.totalWaypoints = 0;
              route.totalCompletedWaypoints = 0;
            }
          })
        );
      },

      async loadAllDirections(): Promise<void> {
        const routes = store.routes();

        if (routes.length === 0) {
          console.log('⚠️ No hay rutas para cargar direcciones');
          return;
        }

        patchState(store, { isLoadingDirections: true });

        try {
          const batchSize = 5;
          for (let i = 0; i < routes.length; i += batchSize) {
            const batch = routes.slice(i, i + batchSize);
            await Promise.all(
              batch.map(route => this.loadDirectionsForRoute(route.id))
            );
          }

        } catch (error) {
          console.error('❌ Error al cargar direcciones:', error);
        } finally {
          patchState(store, { isLoadingDirections: false });
        }
      },

      async loadDirectionsForRoute(routeId: string): Promise<void> {
        const route = store.routes().find(r => r.id === routeId);
        if (!route) {
          console.error(`❌ Ruta ${routeId} no encontrada`);
          return;
        }

        if (store.routeDirections().has(routeId)) {
          console.log(`✓ Direcciones ya cargadas para ruta ${routeId.substring(0, 8)}`);
          return;
        }

        if (route.waypoints.length === 0) {
          console.warn(`⚠️ Ruta ${routeId} no tiene waypoints`);
          return;
        }

        const containersMap = store.containersMap();
        const waypointsWithContainers = route.waypoints
          .map(wp => ({
            waypoint: wp,
            container: containersMap.get(wp.containerId)
          }))
          .filter(item => item.container !== undefined);

        if (waypointsWithContainers.length === 0) {
          console.warn(`⚠️ No se encontraron containers para los waypoints de la ruta ${routeId}`);
          return;
        }

        waypointsWithContainers.sort((a, b) =>
          a.waypoint.sequenceOrder - b.waypoint.sequenceOrder
        );

        const firstContainer = waypointsWithContainers[0].container!;
        const lastContainer = waypointsWithContainers[waypointsWithContainers.length - 1].container!;

        const origin = {
          lat: parseFloat(firstContainer.latitude),
          lng: parseFloat(firstContainer.longitude)
        };

        const destination = {
          lat: parseFloat(lastContainer.latitude),
          lng: parseFloat(lastContainer.longitude)
        };

        const intermediateWaypoints = waypointsWithContainers
          .slice(1, -1)
          .map(item => ({
            lat: parseFloat(item.container!.latitude),
            lng: parseFloat(item.container!.longitude)
          }));

        try {
          const directions = await directionsService.getDirections(
            origin,
            destination,
            intermediateWaypoints
          );

          if (directions) {
            const newDirections = new Map(store.routeDirections());
            newDirections.set(routeId, directions);

            patchState(store, {
              routeDirections: newDirections
            });
          } else {
            console.error(`❌ No se pudieron obtener direcciones para ruta ${routeId}`);
          }

        } catch (error) {
          console.error(`❌ Error al cargar direcciones para ruta ${routeId}:`, error);
        }
      },

      async refreshRoutes(): Promise<void> {
        await this.loadActiveRoutes();
      },

      selectRoute(routeId: string | null): void {
        patchState(store, { selectedRouteId: routeId });
      },

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

      setError(error: string | null): void {
        patchState(store, { error });
      },

      setLoading(loading: boolean): void {
        patchState(store, { isLoading: loading });
      },

      resetState(): void {
        patchState(store, initialState);
      },

      getRouteById(id: string): RouteEntity | undefined {
        return store.routes().find(route => route.id === id);
      },

      getRoutesByStatus(status: RouteStatusEnum): RouteEntity[] {
        return store.routes().filter(route => route.status === status);
      },

      getRoutesWithMostWaypoints(limit: number = 5): RouteEntity[] {
        return [...store.routes()]
          .sort((a, b) => b.waypoints.length - a.waypoints.length)
          .slice(0, limit);
      }
    };
  })
);
