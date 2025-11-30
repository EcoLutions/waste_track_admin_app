import {patchState, signalStore, withComputed, withMethods, withState} from '@ngrx/signals';
import {computed, inject} from '@angular/core';
import {Router} from '@angular/router';
import {
  DriverService,
  RouteEntity,
  RouteService,
  RouteStatusEnum,
  VehicleService
} from '../../../../entities';
import {DistrictContextStore} from '../../../../shared/stores/district-context.store';
import {DateTimeUtils} from '../../../../shared/libs/utils/date-time.utils';

export interface CreateRouteState {
  // Form data
  formData: {
    districtId: string;
    driverId: string;
    vehicleId: string;
    scheduledDate: string; // YYYY-MM-DD
    scheduledStartTime: string; // HH:MM
  };

  // Available options from the backend
  availableDrivers: any[]; // Will be typed as DriverEntity[]
  availableVehicles: any[]; // Will be typed as VehicleEntity[]
  isLoadingOptions: boolean;

  // UI state
  isLoading: boolean;
  error: string | null;
  isSuccess: boolean;
}

const initialState: CreateRouteState = {
  formData: {
    districtId: '',
    driverId: '',
    vehicleId: '',
    scheduledDate: '',
    scheduledStartTime: '',
  },
  availableDrivers: [],
  availableVehicles: [],
  isLoadingOptions: false,
  isLoading: false,
  error: null,
  isSuccess: false
};

function getVehicleTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    'TRUCK': 'Camión',
    'VAN': 'Furgoneta',
    'COMPACTOR': 'Compactador',
    'PICKUP': 'Camioneta'
  };
  return labels[type] || type;
}

export const CreateRouteStore = signalStore(
  // State
  withState(initialState),

  // Computed properties
  withComputed((state) => {
    const districtContextStore = inject(DistrictContextStore);

    return {
      isFormValid: computed(() => {
        const form = state.formData();
        return form.driverId.trim() !== '' &&
          form.vehicleId.trim() !== '' &&
          form.scheduledDate.trim() !== '' &&
          form.scheduledStartTime.trim() !== '';
      }),

      // District context
      districtId: computed(() => districtContextStore.districtId()),
      districtName: computed(() => districtContextStore.districtName()),

      routePreview: computed((): Partial<RouteEntity> => {
        const form = state.formData();
        const districtId = districtContextStore.districtId();

        // Combine date and time for preview
        let scheduledStartAt: Date;
        if (form.scheduledDate && form.scheduledStartTime) {
          const dateTimeString = `${form.scheduledDate}T${form.scheduledStartTime}:00`;
          scheduledStartAt = DateTimeUtils.stringToLocalDateTime(dateTimeString) ?? new Date();
        } else {
          scheduledStartAt = new Date();
        }

        return {
          id: 'preview',
          districtId: districtId || '',
          driverId: form.driverId || null,
          vehicleId: form.vehicleId || null,
          status: RouteStatusEnum.DRAFT,
          scheduledStartAt,
          scheduledEndAt: null, // Backend calculates this
          startedAt: null,
          completedAt: null,
          waypoints: [],
          totalDistance: null,
          estimatedDuration: null,
          collectionDuration: null,
          returnDuration: null,
          actualDuration: null,
          currentLatitude: null,
          currentLongitude: null,
          lastLocationUpdate: null,
          createdAt: null,
          updatedAt: null
        };
      })
    };
  }),

  // Methods
  withMethods((store) => {
    const routeService = inject(RouteService);
    const driverService = inject(DriverService);
    const vehicleService = inject(VehicleService);
    const router = inject(Router);
    const districtContextStore = inject(DistrictContextStore);

    return {
      // Load available drivers and vehicles
      async loadAvailableOptions(): Promise<void> {
        const districtId = districtContextStore.districtId();

        if (!districtId) {
          console.warn('Cannot load options: district ID not available');
          return;
        }

        patchState(store, { isLoadingOptions: true });

        try {
          // Load drivers and vehicles in parallel
          const [drivers, vehicles] = await Promise.all([
            new Promise<any[]>((resolve, reject) => {
              driverService.getAll().subscribe({
                next: (data) => resolve(data),
                error: (err) => reject(err)
              });
            }),
            new Promise<any[]>((resolve, reject) => {
              vehicleService.getAll().subscribe({
                next: (data) => resolve(data),
                error: (err) => reject(err)
              });
            })
          ]);

          // Filter and MAP drivers with fullName
          const availableDrivers = drivers
            .filter((d: any) =>
              d.districtId === districtId &&
              (d.status === 'AVAILABLE' || d.status === 'available')
            )
            .map((d: any) => ({
              ...d,
              fullName: `${d.firstName} ${d.lastName}`
            }));

          // Filter and MAP vehicles with display (using licensePlate + vehicleType)
          const availableVehicles = vehicles
            .filter((v: any) =>
              v.districtId === districtId &&
              v.isActive === true
            )
            .map((v: any) => ({
              ...v,
              display: `${v.licensePlate} - ${getVehicleTypeLabel(v.vehicleType)}`
            }));

          patchState(store, {
            availableDrivers,
            availableVehicles,
            isLoadingOptions: false
          });

        } catch (error) {
          console.error('Error loading options:', error);
          patchState(store, {
            isLoadingOptions: false,
            error: 'Error al cargar conductores y vehículos disponibles'
          });
        }
      },

      // Form actions
      updateFormField<K extends keyof CreateRouteState['formData']>(
        field: K,
        value: CreateRouteState['formData'][K]
      ): void {
        patchState(store, (state) => ({
          formData: {
            ...state.formData,
            [field]: value
          }
        }));
      },

      updateFormData(formData: Partial<CreateRouteState['formData']>): void {
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

      setError(error: string | null): void {
        patchState(store, { error });
      },

      // Route creation
      async createRoute(): Promise<void> {
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

        const formData = store.formData();

        // Validate that we have all required date/time data
        if (!formData.scheduledDate || !formData.scheduledStartTime) {
          patchState(store, {
            error: 'Por favor complete la fecha y hora de inicio'
          });
          return;
        }

        patchState(store, {
          isLoading: true,
          error: null
        });

        try {
          // Combine date and time into valid LocalDateTime string
          // Format: "YYYY-MM-DDHH:MM:SS"
          const dateTimeString = `${formData.scheduledDate}T${formData.scheduledStartTime}:00`;

          // Parse to Date object for validation
          const scheduledStartAt = DateTimeUtils.stringToLocalDateTime(dateTimeString);

          // Validate that date is valid
          if (!scheduledStartAt || isNaN(scheduledStartAt.getTime())) {
            patchState(store, {
              isLoading: false,
              error: 'La fecha u hora programada no es válida'
            });
            return;
          }

          // Validate that date is not in the past (optional)
          const now = new Date();
          if (scheduledStartAt < now) {
            patchState(store, {
              isLoading: false,
              error: 'La fecha programada no puede ser anterior a la fecha actual'
            });
            return;
          }

          // Create a route entity from form data
          const routeEntity: RouteEntity = {
            id: '', // Will be generated by the backend
            districtId: districtId,
            driverId: formData.driverId || null,
            vehicleId: formData.vehicleId || null,
            status: RouteStatusEnum.DRAFT,
            scheduledStartAt,
            scheduledEndAt: null, // Backend will calculate this
            startedAt: null,
            completedAt: null,
            waypoints: [],
            totalDistance: null,
            estimatedDuration: null,
            collectionDuration: null,
            returnDuration: null,
            actualDuration: null,
            currentLatitude: null,
            currentLongitude: null,
            lastLocationUpdate: null,
            createdAt: null,
            updatedAt: null
          };

          console.log('🚀 Creating route with entity:', routeEntity);
          console.log('📅 scheduledStartAt (Date):', scheduledStartAt);
          console.log('📅 scheduledStartAt (LocalDateTime string sent to backend):', DateTimeUtils.localDateTimeToString(scheduledStartAt));

          routeService.create(routeEntity).subscribe({
            next: (createdRoute) => {
              console.log('✅ Route created successfully:', createdRoute);

              patchState(store, {
                isLoading: false,
                isSuccess: true,
                error: null
              });

              // Navigate to routes management after successful creation
              setTimeout(() => {
                router.navigate(['/routes']);
              }, 1500);
            },
            error: (error) => {
              console.error('❌ Error creating route:', error);

              // Extract error message from backend response
              let errorMessage = 'Error al crear la ruta. Por favor intente nuevamente.';

              if (error?.error?.message) {
                errorMessage = error.error.message;
              } else if (error?.message) {
                errorMessage = error.message;
              }

              patchState(store, {
                isLoading: false,
                error: errorMessage
              });
            }
          });
        } catch (error) {
          console.error('❌ Unexpected error:', error);
          patchState(store, {
            isLoading: false,
            error: 'Error inesperado al crear la ruta'
          });
        }
      }
    };
  })
);
