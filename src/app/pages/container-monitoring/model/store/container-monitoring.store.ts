import { computed, inject } from '@angular/core';
import { ContainerService } from '../../../../../entities';
import { ContainerEntity } from '../../../../../entities';
import { ContainerStatusEnum, ContainerTypeEnum } from '../../../../../entities';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { firstValueFrom } from 'rxjs';

export interface ContainerMonitoringState {
  containers: ContainerEntity[];
  filteredContainers: ContainerEntity[];
  selectedContainer: ContainerEntity | null;
  isLoading: boolean;
  error: string | null;
  mapCenter: { lat: number; lng: number };
  mapZoom: number;
  statusFilter: ContainerStatusEnum | 'ALL';
  typeFilter: ContainerTypeEnum | 'ALL';
  searchQuery: string;
}

const initialState: ContainerMonitoringState = {
  containers: [],
  filteredContainers: [],
  selectedContainer: null,
  isLoading: false,
  error: null,
  mapCenter: { lat: -12.0464, lng: -77.0428 }, // Lima, Perú
  mapZoom: 10,
  statusFilter: 'ALL',
  typeFilter: 'ALL',
  searchQuery: ''
};

export const ContainerMonitoringStore = signalStore(
  { providedIn: 'root' },
  withState<ContainerMonitoringState>(initialState),

  withComputed((state) => ({
    // Estadísticas de containers
    totalContainers: computed(() => state.containers().length),
    activeContainers: computed(() =>
      state.containers().filter(c => c.status === ContainerStatusEnum.ACTIVE).length
    ),
    maintenanceContainers: computed(() =>
      state.containers().filter(c => c.status === ContainerStatusEnum.MAINTENANCE).length
    ),
    decommissionedContainers: computed(() =>
      state.containers().filter(c => c.status === ContainerStatusEnum.DECOMMISSIONED).length
    ),

    // Containers por tipo
    organicContainers: computed(() =>
      state.containers().filter(c => c.containerType === ContainerTypeEnum.ORGANIC).length
    ),
    recyclableContainers: computed(() =>
      state.containers().filter(c => c.containerType === ContainerTypeEnum.RECYCLABLE).length
    ),
    generalContainers: computed(() =>
      state.containers().filter(c => c.containerType === ContainerTypeEnum.GENERAL).length
    ),

    // Containers con nivel alto de llenado (>80%)
    highFillLevelContainers: computed(() =>
      state.containers().filter(c => c.currentFillLevel > 80).length
    ),

    // Containers que necesitan mantenimiento (última lectura > 7 días)
    containersNeedingMaintenance: computed(() => {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      return state.containers().filter(c =>
        c.lastReadingTimestamp && c.lastReadingTimestamp < sevenDaysAgo
      ).length;
    }),

    // Containers activos con ubicación válida
    mappableContainers: computed(() =>
      state.filteredContainers().filter(c =>
        c.latitude && c.longitude &&
        !isNaN(parseFloat(c.latitude)) && !isNaN(parseFloat(c.longitude))
      )
    ),

    // Estado del mapa
    hasValidContainers: computed(() =>
      state.filteredContainers().some(c =>
        c.latitude && c.longitude &&
        !isNaN(parseFloat(c.latitude)) && !isNaN(parseFloat(c.longitude))
      )
    )
  })),

  withMethods((store) => {
    const containerService = inject(ContainerService);

    return {
      /**
       * Cargar todos los containers desde el servicio
       */
      async loadContainers(): Promise<void> {
        patchState(store, {
          isLoading: true,
          error: null
        });

        try {
          const containers = await firstValueFrom(containerService.getAll());

          patchState(store, {
            containers,
            isLoading: false
          });

          this.applyFilters();
        } catch (error: any) {
          patchState(store, {
            isLoading: false,
            error: error.message || 'Error al cargar los contenedores'
          });
        }
      },

      /**
       * Seleccionar un container específico
       */
      selectContainer(container: ContainerEntity | null): void {
        patchState(store, {
          selectedContainer: container
        });
      },

      /**
       * Aplicar filtros a los containers
       */
      applyFilters(): void {
        const { containers, statusFilter, typeFilter, searchQuery } = store;

        let filtered = [...containers()];

        // Filtrar por estado
        if (statusFilter() !== 'ALL') {
          filtered = filtered.filter(c => c.status === statusFilter());
        }

        // Filtrar por tipo
        if (typeFilter() !== 'ALL') {
          filtered = filtered.filter(c => c.containerType === typeFilter());
        }

        // Filtrar por búsqueda (address o districtCode)
        if (searchQuery().trim()) {
          const query = searchQuery().toLowerCase().trim();
          filtered = filtered.filter(c =>
            c.address.toLowerCase().includes(query) ||
            c.districtCode.toLowerCase().includes(query) ||
            c.id.toLowerCase().includes(query)
          );
        }

        patchState(store, {
          filteredContainers: filtered
        });
      },

      /**
       * Establecer filtro de estado
       */
      setStatusFilter(status: ContainerStatusEnum | 'ALL'): void {
        patchState(store, { statusFilter: status });
        this.applyFilters();
      },

      /**
       * Establecer filtro de tipo
       */
      setTypeFilter(type: ContainerTypeEnum | 'ALL'): void {
        patchState(store, { typeFilter: type });
        this.applyFilters();
      },

      /**
       * Establecer búsqueda
       */
      setSearchQuery(query: string): void {
        patchState(store, { searchQuery: query });
        this.applyFilters();
      },

      /**
       * Actualizar centro del mapa
       */
      setMapCenter(lat: number, lng: number): void {
        patchState(store, {
          mapCenter: { lat, lng }
        });
      },

      /**
       * Actualizar zoom del mapa
       */
      setMapZoom(zoom: number): void {
        patchState(store, { mapZoom: zoom });
      },

      /**
       * Obtener container por ID
       */
      getContainerById(id: string): ContainerEntity | undefined {
        return store.containers().find(c => c.id === id);
      },

      /**
       * Actualizar datos de un container específico
       */
      updateContainer(id: string, updates: Partial<ContainerEntity>): void {
        const containers = store.containers();
        const index = containers.findIndex(c => c.id === id);

        if (index !== -1) {
          const updatedContainers = [...containers];
          updatedContainers[index] = { ...updatedContainers[index], ...updates };

          patchState(store, {
            containers: updatedContainers
          });

          this.applyFilters();
        }
      },

      /**
       * Limpiar filtros
       */
      clearFilters(): void {
        patchState(store, {
          statusFilter: 'ALL',
          typeFilter: 'ALL',
          searchQuery: '',
          filteredContainers: store.containers()
        });
      },

      /**
       * Obtener containers para mostrar en el mapa
       */
      getMapContainers(): ContainerEntity[] {
        return store.mappableContainers();
      },

      /**
       * Obtener estadísticas rápidas
       */
      getQuickStats(): {
        total: number;
        active: number;
        maintenance: number;
        highFillLevel: number;
        needingMaintenance: number;
      } {
        const containers = store.containers();
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        return {
          total: containers.length,
          active: containers.filter(c => c.status === ContainerStatusEnum.ACTIVE).length,
          maintenance: containers.filter(c => c.status === ContainerStatusEnum.MAINTENANCE).length,
          highFillLevel: containers.filter(c => c.currentFillLevel > 80).length,
          needingMaintenance: containers.filter(c =>
            c.lastReadingTimestamp && c.lastReadingTimestamp < sevenDaysAgo
          ).length
        };
      }
    };
  })
);
