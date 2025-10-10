import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { DriverService } from '../../../../../entities';
import { DriverEntity, DriverStatusEnum } from '../../../../../entities';
import { DistrictContextStore } from '../../../../../shared/stores/district-context.store';

export interface CreateDriverState {
  // Form data
  formData: {
    firstName: string;
    lastName: string;
    documentNumber: string;
    phoneNumber: string;
    emailAddress: string;
    licenseNumber: string;
    licenseExpiryDate: string;
    status: DriverStatusEnum;
    assignedVehicleId: string;
  };

  // UI state
  isLoading: boolean;
  error: string | null;
  isSuccess: boolean;
}

const initialState: CreateDriverState = {
  formData: {
    firstName: '',
    lastName: '',
    documentNumber: '',
    phoneNumber: '',
    emailAddress: '',
    licenseNumber: '',
    licenseExpiryDate: '',
    status: DriverStatusEnum.AVAILABLE,
    assignedVehicleId: ''
  },
  isLoading: false,
  error: null,
  isSuccess: false
};

// Helper function to generate random user ID (backend should handle this, but as fallback)
function generateRandomUserId(): string {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 9);
  return `USR-${timestamp}-${randomStr}`.toUpperCase();
}

export const CreateDriverStore = signalStore(
  { providedIn: 'root' },

  // State
  withState(initialState),

  // Computed properties
  withComputed((state) => {
    const districtContextStore = inject(DistrictContextStore);

    return {
      isFormValid: computed(() => {
        const form = state.formData();
        return form.firstName.trim() !== '' &&
          form.lastName.trim() !== '' &&
          form.documentNumber.trim() !== '' &&
          form.phoneNumber.trim() !== '' &&
          form.emailAddress.trim() !== '' &&
          form.licenseNumber.trim() !== '' &&
          form.licenseExpiryDate.trim() !== '';
      }),

      // District context
      districtId: computed(() => districtContextStore.districtId()),
      districtName: computed(() => districtContextStore.districtName()),

      driverPreview: computed((): Partial<DriverEntity> => {
        const form = state.formData();
        const districtId = districtContextStore.districtId();

        return {
          id: 'preview',
          districtId: districtId || '',
          firstName: form.firstName,
          lastName: form.lastName,
          documentNumber: form.documentNumber,
          phoneNumber: form.phoneNumber,
          emailAddress: form.emailAddress,
          driverLicense: form.licenseNumber,
          licenseExpiryDate: form.licenseExpiryDate ? new Date(form.licenseExpiryDate) : new Date(),
          status: form.status,
          assignedVehicleId: form.assignedVehicleId || null,
          totalHoursWorked: 0,
          lastRouteCompletedAt: null,
          userId: 'preview', // This won't be sent to backend
          createdAt: null,
          updatedAt: null
        };
      })
    };
  }),

  // Methods
  withMethods((store) => {
    const driverService = inject(DriverService);
    const router = inject(Router);
    const districtContextStore = inject(DistrictContextStore);

    return {
      // Form actions
      updateFormField<K extends keyof CreateDriverState['formData']>(
        field: K,
        value: CreateDriverState['formData'][K]
      ): void {
        patchState(store, (state) => ({
          formData: {
            ...state.formData,
            [field]: value
          }
        }));
      },

      updateFormData(formData: Partial<CreateDriverState['formData']>): void {
        patchState(store, (state) => ({
          formData: {
            ...state.formData,
            ...formData
          }
        }));
      },

      resetForm(): void {
        patchState(store, {
          formData: initialState.formData,
          error: null,
          isSuccess: false
        });
      },

      // Driver creation
      async createDriver(): Promise<void> {
        if (!store.isFormValid()) {
          patchState(store, {
            error: 'Por favor complete todos los campos requeridos'
          });
          return;
        }

        // Check if district context is available
        const districtId = districtContextStore.districtId();

        if (!districtId) {
          patchState(store, {
            error: 'No se pudo obtener la información del distrito. Por favor recargue la página.'
          });
          return;
        }

        patchState(store, {
          isLoading: true,
          error: null
        });

        try {
          const formData = store.formData();

          // Create driver entity from form data
          // Note: userId is generated randomly as a fallback
          // The backend should ideally handle user creation and ID generation
          const driverEntity: DriverEntity = {
            id: '', // Will be generated by backend
            districtId: districtId,
            firstName: formData.firstName,
            lastName: formData.lastName,
            documentNumber: formData.documentNumber,
            phoneNumber: formData.phoneNumber,
            emailAddress: formData.emailAddress,
            driverLicense: formData.licenseNumber,
            licenseExpiryDate: new Date(formData.licenseExpiryDate),
            status: formData.status,
            assignedVehicleId: formData.assignedVehicleId || null,
            totalHoursWorked: 0,
            lastRouteCompletedAt: null,
            // Generate random userId (backend should override this)
            userId: generateRandomUserId(),
            createdAt: null,
            updatedAt: null
          };

          driverService.create(driverEntity).subscribe({
            next: () => {
              patchState(store, {
                isLoading: false,
                isSuccess: true,
                error: null
              });

              // Navigate to drivers management after successful creation
              setTimeout(() => {
                router.navigate(['/users/drivers']);
              }, 1500);
            },
            error: (error) => {
              patchState(store, {
                isLoading: false,
                error: error.message || 'Error al crear el conductor',
                isSuccess: false
              });
            }
          });

        } catch (error) {
          patchState(store, {
            isLoading: false,
            error: 'Error inesperado al crear el conductor',
            isSuccess: false
          });
        }
      },

      // Utility methods
      setError(error: string | null): void {
        patchState(store, { error });
      },

      setLoading(loading: boolean): void {
        patchState(store, { isLoading: loading });
      }
    };
  })
);
