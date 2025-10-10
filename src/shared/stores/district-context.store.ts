import { computed, inject } from '@angular/core';
import { DistrictService } from '../../entities';
import { DistrictEntity } from '../../entities';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { firstValueFrom } from 'rxjs';
import {HeaderStore} from '../../features/layout/model/header.store';

export interface DistrictContextState {
  district: DistrictEntity | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: DistrictContextState = {
  district: null,
  isLoading: false,
  error: null
};

export const DistrictContextStore = signalStore(
  { providedIn: 'root' },
  withState<DistrictContextState>(initialState),

  withComputed((state) => {
    const headerStore = inject(HeaderStore);

    return {
      districtId: computed(() => headerStore.profile()?.districtId || null),
      districtName: computed(() => state.district()?.name || null),
      districtCode: computed(() => state.district()?.code || null),
      isDistrictLoaded: computed(() => !!state.district()),
      hasError: computed(() => !!state.error())
    };
  }),

  withMethods((store) => {
    const districtService = inject(DistrictService);
    const headerStore = inject(HeaderStore);

    return {
      /**
       * Initialize district context
       * This method should be called when the app starts and user profile is loaded
       */
      async initializeDistrictContext(): Promise<void> {
        const districtId = headerStore.profile()?.districtId;

        if (!districtId) {
          patchState(store, {
            error: 'No se encontró ID de distrito en el perfil del usuario'
          });
          return;
        }

        patchState(store, {
          isLoading: true,
          error: null
        });

        try {
          const district = await firstValueFrom(districtService.getById(districtId));

          patchState(store, {
            district,
            isLoading: false
          });
        } catch (error: any) {
          patchState(store, {
            isLoading: false,
            error: error.message || 'Error al cargar información del distrito'
          });
        }
      },

      /**
       * Refresh district data
       */
      async refreshDistrict(): Promise<void> {
        const districtId = headerStore.profile()?.districtId;

        if (!districtId) {
          patchState(store, {
            error: 'No se encontró ID de distrito en el perfil del usuario'
          });
          return;
        }

        patchState(store, {
          isLoading: true,
          error: null
        });

        try {
          const district = await firstValueFrom(districtService.getById(districtId));

          patchState(store, {
            district,
            isLoading: false
          });
        } catch (error: any) {
          patchState(store, {
            isLoading: false,
            error: error.message || 'Error al actualizar información del distrito'
          });
        }
      },

      /**
       * Clear district context (logout)
       */
      clearDistrictContext(): void {
        patchState(store, {
          district: null,
          isLoading: false,
          error: null
        });
      },

      /**
       * Set a district manually (for testing or special cases)
       */
      setDistrict(district: DistrictEntity): void {
        patchState(store, {
          district,
          error: null
        });
      }
    };
  })
);
