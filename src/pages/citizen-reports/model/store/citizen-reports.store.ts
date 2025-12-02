import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { computed, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ReportEntity, ReportService, ReportStatusEnum, ReportTypeEnum } from '../../../../entities';
import { DistrictContextStore } from '../../../../shared/stores/district-context.store';

export interface CitizenReportsState {
  reports: ReportEntity[];
  isLoading: boolean;
  error: string | null;

  // Filtros
  searchTerm: string;
  selectedStatus: ReportStatusEnum | null;
  selectedType: ReportTypeEnum | null;
}

const initialState: CitizenReportsState = {
  reports: [],
  isLoading: false,
  error: null,
  searchTerm: '',
  selectedStatus: null,
  selectedType: null
};

export const CitizenReportsStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),

  withComputed((state) => {
    const districtContextStore = inject(DistrictContextStore);

    return {
      // Métricas para KPIs
      totalReports: computed(() => state.reports().length),

      pendingReportsCount: computed(() =>
        state.reports().filter(r =>
          r.status === ReportStatusEnum.SUBMITTED ||
          r.status === ReportStatusEnum.ACKNOWLEDGED
        ).length
      ),

      resolvedReportsCount: computed(() =>
        state.reports().filter(r => r.status === ReportStatusEnum.RESOLVED).length
      ),

      // Contexto del Distrito
      districtId: computed(() => districtContextStore.districtId()),
      districtName: computed(() => districtContextStore.districtName()),
      isDistrictLoaded: computed(() => districtContextStore.isDistrictLoaded()),

      // Lógica de Filtrado
      filteredReports: computed(() => {
        let filtered = state.reports();

        // 1. Filtro por Estado
        if (state.selectedStatus()) {
          filtered = filtered.filter(r => r.status === state.selectedStatus());
        }

        // 2. Filtro por Tipo
        if (state.selectedType()) {
          filtered = filtered.filter(r => r.reportType === state.selectedType());
        }

        // 3. Búsqueda (ID o Descripción)
        const term = state.searchTerm().toLowerCase();
        if (term) {
          filtered = filtered.filter(r =>
            r.id.toLowerCase().includes(term) ||
            (r.description && r.description.toLowerCase().includes(term))
          );
        }

        // Ordenar por fecha (más reciente primero)
        return filtered.sort((a, b) => {
          const dateA = new Date(a.submittedAt).getTime();
          const dateB = new Date(b.submittedAt).getTime();
          return dateB - dateA;
        });
      }),

      // Estados de carga UI
      hasReports: computed(() => state.reports().length > 0),
      isEmpty: computed(() => !state.isLoading() && state.reports().length === 0)
    };
  }),

  withMethods((store) => {
    const reportService = inject(ReportService);
    const districtContextStore = inject(DistrictContextStore);

    return {
      async loadReports(): Promise<void> {
        patchState(store, { isLoading: true, error: null });

        const districtId = districtContextStore.districtId();
        if (!districtId) {
          patchState(store, {
            isLoading: false,
            error: 'Distrito no cargado',
            reports: []
          });
          return;
        }

        try {
          const reports = await firstValueFrom(reportService.getAllByDistrictId(districtId));
          patchState(store, {
            reports: reports || [],
            isLoading: false
          });
        } catch (error: any) {
          console.error('Error loading reports:', error);
          patchState(store, {
            isLoading: false,
            error: error.message || 'Error al cargar reportes',
            reports: []
          });
        }
      },

      async refreshReports(): Promise<void> {
        await this.loadReports();
      },

      // Setters de Filtros
      setSearchTerm(term: string): void {
        patchState(store, { searchTerm: term });
      },
      setStatusFilter(status: ReportStatusEnum | null): void {
        patchState(store, { selectedStatus: status });
      },
      setTypeFilter(type: ReportTypeEnum | null): void {
        patchState(store, { selectedType: type });
      },

      clearFilters(): void {
        patchState(store, {
          searchTerm: '',
          selectedStatus: null,
          selectedType: null
        });
      },

      setError(error: string | null): void {
        patchState(store, { error });
      }
    };
  })
);
