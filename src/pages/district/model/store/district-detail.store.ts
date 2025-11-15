import {patchState, signalStore, withComputed, withMethods, withState} from '@ngrx/signals';
import {computed, inject} from '@angular/core';
import {DistrictEntity, DistrictService} from '../../../../entities';
import {DistrictContextStore} from '../../../../shared/stores/district-context.store';
import {firstValueFrom} from 'rxjs';
import {DurationUtils} from '../../../../shared/libs/utils/duration.utils';

export interface DistrictDetailState {
  // Data
  district: DistrictEntity | null;

  // Edit mode data
  editFormData: {
    name: string;
    code: string;
    operationStartTime: string;
    operationEndTime: string;
    maxRouteDuration: string; // ISO-8601: "PT8H30M"
    depotLatitude: string;
    depotLongitude: string;
    disposalLatitude: string;
    disposalLongitude: string;
  };

  // UI State
  isLoading: boolean;
  isEditMode: boolean;
  isSaving: boolean;
  error: string | null;
  successMessage: string | null;

  // Map state
  showDepotMap: boolean;
  showDisposalMap: boolean;
}

const initialEditFormData = {
  name: '',
  code: '',
  operationStartTime: '',
  operationEndTime: '',
  maxRouteDuration: '',
  depotLatitude: '',
  depotLongitude: '',
  disposalLatitude: '',
  disposalLongitude: ''
};

const initialState: DistrictDetailState = {
  district: null,
  editFormData: initialEditFormData,
  isLoading: false,
  isEditMode: false,
  isSaving: false,
  error: null,
  successMessage: null,
  showDepotMap: false,
  showDisposalMap: false
};

export const DistrictDetailStore = signalStore(
  { providedIn: 'root' },

  // State
  withState(initialState),

  // Computed - Basic Info
  withComputed((state) => {
    const districtContextStore = inject(DistrictContextStore);

    return {
      districtId: computed(() => districtContextStore.districtId()),
      districtName: computed(() => districtContextStore.districtName()),

      readOnlyData: computed(() => {
        const district = state.district();
        if (!district) return null;

        return {
          operationalStatus: district.operationalStatus,
          serviceStartDate: district.serviceStartDate,
          maxVehicles: district.maxVehicles,
          maxDrivers: district.maxDrivers,
          maxContainers: district.maxContainers,
          currentVehicleCount: district.currentVehicleCount,
          currentDriverCount: district.currentDriverCount,
          currentContainerCount: district.currentContainerCount,
          planName: district.planName,
          planId: district.planId,
          currency: district.currency,
          price: district.price,
          billingPeriod: district.billingPeriod,
          primaryAdminEmail: district.primaryAdminEmail,
          primaryAdminUsername: district.primaryAdminUsername
        };
      })
    };
  }),

  // Computed - Validation
  withComputed((state) => ({
    isFormValid: computed(() => {
      const form = state.editFormData();

      // Basic validation
      const basicValid = form.name.trim() !== '' &&
        form.code.trim() !== '' &&
        form.operationStartTime.trim() !== '' &&
        form.operationEndTime.trim() !== '' &&
        form.maxRouteDuration.trim() !== '' &&
        form.depotLatitude.trim() !== '' &&
        form.depotLongitude.trim() !== '' &&
        form.disposalLatitude.trim() !== '' &&
        form.disposalLongitude.trim() !== '';

      if (!basicValid) return false;

      if (!DurationUtils.isValid(form.maxRouteDuration, 60, 1440)) {
        return false;
      }

      // Validate operation times
      try {
        const [startHour, startMin] = form.operationStartTime.split(':').map(Number);
        const [endHour, endMin] = form.operationEndTime.split(':').map(Number);

        const startMinutes = (startHour * 60) + startMin;
        const endMinutes = (endHour * 60) + endMin;

        if (endMinutes <= startMinutes) {
          return false;
        }
      } catch {
        return false;
      }

      return true;
    }),

    hasChanges: computed(() => {
      const district = state.district();
      const form = state.editFormData();

      if (!district) return false;

      return district.name !== form.name ||
        district.code !== form.code ||
        district.operationStartTime !== form.operationStartTime ||
        district.operationEndTime !== form.operationEndTime ||
        district.maxRouteDuration !== form.maxRouteDuration ||
        district.depotLatitude !== form.depotLatitude ||
        district.depotLongitude !== form.depotLongitude ||
        district.disposalLatitude !== form.disposalLatitude ||
        district.disposalLongitude !== form.disposalLongitude;
    })
  })),

  // Computed - Usage Percentages
  withComputed((state) => ({
    vehicleUsagePercentage: computed(() => {
      const district = state.district();
      if (!district || district.maxVehicles === 0) return 0;
      return Math.round((district.currentVehicleCount / district.maxVehicles) * 100);
    }),

    driverUsagePercentage: computed(() => {
      const district = state.district();
      if (!district || district.maxDrivers === 0) return 0;
      return Math.round((district.currentDriverCount / district.maxDrivers) * 100);
    }),

    containerUsagePercentage: computed(() => {
      const district = state.district();
      if (!district || district.maxContainers === 0) return 0;
      return Math.round((district.currentContainerCount / district.maxContainers) * 100);
    })
  })),

  // Computed - Coordinates
  withComputed((state) => ({
    depotCoordinates: computed(() => {
      const form = state.editFormData();
      return {
        lat: parseFloat(form.depotLatitude) || -12.0464,
        lng: parseFloat(form.depotLongitude) || -77.0428
      };
    }),

    disposalCoordinates: computed(() => {
      const form = state.editFormData();
      return {
        lat: parseFloat(form.disposalLatitude) || -12.0464,
        lng: parseFloat(form.disposalLongitude) || -77.0428
      };
    })
  })),

  // Methods - Data Loading
  withMethods((store) => {
    const districtService = inject(DistrictService);
    const districtContextStore = inject(DistrictContextStore);

    return {
      async loadDistrict(): Promise<void> {
        const districtId = districtContextStore.districtId();

        if (!districtId) {
          patchState(store, {
            error: 'No se pudo obtener el ID del distrito'
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
            isLoading: false,
            editFormData: {
              name: district.name,
              code: district.code,
              operationStartTime: district.operationStartTime,
              operationEndTime: district.operationEndTime,
              maxRouteDuration: district.maxRouteDuration, // Ya viene en ISO-8601 desde backend
              depotLatitude: district.depotLatitude,
              depotLongitude: district.depotLongitude,
              disposalLatitude: district.disposalLatitude,
              disposalLongitude: district.disposalLongitude
            }
          });
        } catch (error: any) {
          patchState(store, {
            isLoading: false,
            error: error.message || 'Error al cargar la información del distrito'
          });
        }
      }
    };
  }),

  // Methods - Edit Mode
  withMethods((store) => ({
    enableEditMode(): void {
      patchState(store, {
        isEditMode: true,
        error: null,
        successMessage: null
      });
    },

    cancelEditMode(): void {
      const district = store.district();

      if (!district) return;

      patchState(store, {
        isEditMode: false,
        error: null,
        successMessage: null,
        showDepotMap: false,
        showDisposalMap: false,
        editFormData: {
          name: district.name,
          code: district.code,
          operationStartTime: district.operationStartTime,
          operationEndTime: district.operationEndTime,
          maxRouteDuration: district.maxRouteDuration,
          depotLatitude: district.depotLatitude,
          depotLongitude: district.depotLongitude,
          disposalLatitude: district.disposalLatitude,
          disposalLongitude: district.disposalLongitude
        }
      });
    }
  })),

  // Methods - Form Updates
  withMethods((store) => ({
    updateFormField(field: string, value: string): void {
      patchState(store, (state) => ({
        editFormData: {
          ...state.editFormData,
          [field]: value
        } as typeof state.editFormData
      }));
    },

    updateDuration(hours: number, minutes: number): void {
      const isoDuration = DurationUtils.toIsoDuration(hours, minutes);
      patchState(store, (state) => ({
        editFormData: {
          ...state.editFormData,
          maxRouteDuration: isoDuration
        }
      }));
    },

    updateDepotCoordinates(lat: number, lng: number): void {
      patchState(store, (state) => ({
        editFormData: {
          ...state.editFormData,
          depotLatitude: lat.toFixed(6),
          depotLongitude: lng.toFixed(6)
        }
      }));
    },

    updateDisposalCoordinates(lat: number, lng: number): void {
      patchState(store, (state) => ({
        editFormData: {
          ...state.editFormData,
          disposalLatitude: lat.toFixed(6),
          disposalLongitude: lng.toFixed(6)
        }
      }));
    }
  })),

  // Methods - Map Toggles
  withMethods((store) => ({
    toggleDepotMap(): void {
      patchState(store, (state) => ({
        showDepotMap: !state.showDepotMap
      }));
    },

    toggleDisposalMap(): void {
      patchState(store, (state) => ({
        showDisposalMap: !state.showDisposalMap
      }));
    }
  })),

  // Methods - Save Changes
  withMethods((store) => {
    const districtService = inject(DistrictService);
    const districtContextStore = inject(DistrictContextStore);

    return {
      async saveChanges(): Promise<void> {
        if (!store.isFormValid()) {
          patchState(store, {
            error: 'Por favor complete todos los campos requeridos correctamente'
          });
          return;
        }

        const district = store.district();
        const districtId = districtContextStore.districtId();

        if (!district || !districtId) {
          patchState(store, {
            error: 'No se pudo obtener la información del distrito'
          });
          return;
        }

        patchState(store, {
          isSaving: true,
          error: null,
          successMessage: null
        });

        try {
          const form = store.editFormData();

          const updatedDistrict: DistrictEntity = {
            ...district,
            name: form.name,
            code: form.code,
            operationStartTime: form.operationStartTime,
            operationEndTime: form.operationEndTime,
            maxRouteDuration: form.maxRouteDuration, // ISO-8601 format
            depotLatitude: form.depotLatitude,
            depotLongitude: form.depotLongitude,
            disposalLatitude: form.disposalLatitude,
            disposalLongitude: form.disposalLongitude
          };

          await firstValueFrom(districtService.update(districtId, updatedDistrict));

          await store.loadDistrict();
          await districtContextStore.refreshDistrict();

          patchState(store, {
            isSaving: false,
            isEditMode: false,
            showDepotMap: false,
            showDisposalMap: false,
            successMessage: 'Los cambios se guardaron exitosamente',
            error: null
          });

          setTimeout(() => {
            patchState(store, { successMessage: null });
          }, 3000);

        } catch (error: any) {
          patchState(store, {
            isSaving: false,
            error: error.message || 'Error al guardar los cambios'
          });
        }
      }
    };
  }),

  // Methods - Utility
  withMethods((store) => ({
    setError(error: string | null): void {
      patchState(store, { error });
    },

    clearMessages(): void {
      patchState(store, {
        error: null,
        successMessage: null
      });
    },

    resetState(): void {
      patchState(store, initialState);
    }
  }))
);
