import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { computed, inject } from '@angular/core';
import { CitizenService } from '../../../../../entities';
import { CitizenEntity, MembershipLevelEnum } from '../../../../../entities';
import { DistrictContextStore } from '../../../../../shared/stores/district-context.store';
import {firstValueFrom} from 'rxjs';

export interface CitizensState {
  // Data
  citizens: CitizenEntity[];
  filteredCitizens: CitizenEntity[];

  // UI State
  isLoading: boolean;
  error: string | null;

  // Filters
  searchTerm: string;
  selectedMembershipLevel: MembershipLevelEnum | null;
  showActiveOnly: boolean;
}

const initialState: CitizensState = {
  citizens: [],
  filteredCitizens: [],
  isLoading: false,
  error: null,
  searchTerm: '',
  selectedMembershipLevel: null,
  showActiveOnly: true
};

export const CitizensStore = signalStore(
  { providedIn: 'root' },

  // State
  withState(initialState),

  // Computed properties
  withComputed((state) => {
    const districtContextStore = inject(DistrictContextStore);

    return {
      // Basically computed
      totalCitizens: computed(() => state.citizens().length),
      bronzeMembers: computed(() =>
        state.citizens().filter(citizen => citizen.membershipLevel === MembershipLevelEnum.BRONZE)
      ),
      silverMembers: computed(() =>
        state.citizens().filter(citizen => citizen.membershipLevel === MembershipLevelEnum.SILVER)
      ),
      goldMembers: computed(() =>
        state.citizens().filter(citizen => citizen.membershipLevel === MembershipLevelEnum.GOLD)
      ),

      // Statistics
      citizensByMembership: computed(() => {
        const citizens = state.citizens();
        return Object.values(MembershipLevelEnum).map(level => ({
          level,
          count: citizens.filter(c => c.membershipLevel === level).length,
          label: getMembershipLabel(level)
        }));
      }),

      totalPoints: computed(() => {
        return state.citizens()
          .reduce((total, citizen) => total + citizen.totalPoints, 0);
      }),

      averagePointsPerCitizen: computed(() => {
        const citizens = state.citizens();
        if (citizens.length === 0) return 0;
        return state.citizens().reduce((total, citizen) => total + citizen.totalPoints, 0) / citizens.length;
      }),

      totalReportsSubmitted: computed(() => {
        return state.citizens()
          .reduce((total, citizen) => total + citizen.totalReportsSubmitted, 0);
      }),

      // Most active citizens (by reports submitted)
      mostActiveCitizens: computed(() => {
        return [...state.citizens()]
          .sort((a, b) => b.totalReportsSubmitted - a.totalReportsSubmitted)
          .slice(0, 10);
      }),

      // District context
      districtId: computed(() => districtContextStore.districtId()),
      districtName: computed(() => districtContextStore.districtName()),
      isDistrictLoaded: computed(() => districtContextStore.isDistrictLoaded()),

      // Filtered citizens (client-side filtering for better UX)
      filteredCitizens: computed(() => {
        let filtered = state.citizens();

        // Filter by membership level
        if (state.selectedMembershipLevel()) {
          filtered = filtered.filter(citizen => citizen.membershipLevel === state.selectedMembershipLevel());
        }

        // Filter by activity (show only citizens with recent activity)
        if (state.showActiveOnly()) {
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

          filtered = filtered.filter(citizen =>
            citizen.lastActivityDate >= thirtyDaysAgo
          );
        }

        // Filter by search term
        if (state.searchTerm()) {
          const searchTerm = state.searchTerm().toLowerCase();
          filtered = filtered.filter(citizen =>
            citizen.firstName.toLowerCase().includes(searchTerm) ||
            citizen.lastName.toLowerCase().includes(searchTerm) ||
            citizen.email.toLowerCase().includes(searchTerm) ||
            citizen.phoneNumber.toLowerCase().includes(searchTerm)
          );
        }

        return filtered;
      }),

      // Loading states
      hasCitizens: computed(() => state.citizens().length > 0),
      hasFilteredResults: computed(() => state.filteredCitizens().length > 0),
      isEmpty: computed(() => !state.isLoading() && state.citizens().length === 0)
    };
  }),

  // Methods
  withMethods((store) => {
    const citizenService = inject(CitizenService);
    const districtContextStore = inject(DistrictContextStore);

    return {
      // Load citizens from API
      async loadCitizens(): Promise<void> {
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
          const citizens = await firstValueFrom(citizenService.getAllByDistrictId(districtId));

          patchState(store, {
            citizens: citizens || [],
            isLoading: false
          });
        } catch (error: any) {
          patchState(store, {
            isLoading: false,
            error: error.message || 'Error al cargar los ciudadanos',
            citizens: []
          });
        }
      },

      // Refresh citizens data
      async refreshCitizens(): Promise<void> {
        await this.loadCitizens();
      },

      // Filter methods
      setSearchTerm(searchTerm: string): void {
        patchState(store, { searchTerm });
      },

      setMembershipFilter(membershipLevel: MembershipLevelEnum | null): void {
        patchState(store, { selectedMembershipLevel: membershipLevel });
      },

      setShowActiveOnly(showActiveOnly: boolean): void {
        patchState(store, { showActiveOnly });
      },

      // Clear all filters
      clearFilters(): void {
        patchState(store, {
          searchTerm: '',
          selectedMembershipLevel: null,
          showActiveOnly: true
        });
      },

      // Citizen management
      addCitizen(citizen: CitizenEntity): void {
        patchState(store, (state) => ({
          citizens: [...state.citizens, citizen]
        }));
      },

      updateCitizen(id: string, updates: Partial<CitizenEntity>): void {
        patchState(store, (state) => ({
          citizens: state.citizens.map(citizen =>
            citizen.id === id ? { ...citizen, ...updates } : citizen
          )
        }));
      },

      removeCitizen(id: string): void {
        patchState(store, (state) => ({
          citizens: state.citizens.filter(citizen => citizen.id !== id)
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

      // Get citizen by ID
      getCitizenById(id: string): CitizenEntity | undefined {
        return store.citizens().find(citizen => citizen.id === id);
      },

      // Get citizens by membership level
      getCitizensByMembership(membershipLevel: MembershipLevelEnum): CitizenEntity[] {
        return store.citizens().filter(citizen => citizen.membershipLevel === membershipLevel);
      },

      // Get top contributors (by points)
      getTopContributors(limit: number = 10): CitizenEntity[] {
        return [...store.citizens()]
          .sort((a, b) => b.totalPoints - a.totalPoints)
          .slice(0, limit);
      }
    };
  })
);

// Helper function for membership labels
function getMembershipLabel(level: MembershipLevelEnum): string {
  const labels = {
    [MembershipLevelEnum.BRONZE]: 'Bronce',
    [MembershipLevelEnum.SILVER]: 'Plata',
    [MembershipLevelEnum.GOLD]: 'Oro'
  };
  return labels[level] || level;
}
