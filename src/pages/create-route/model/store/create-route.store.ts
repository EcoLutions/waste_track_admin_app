import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { RouteEntity, RouteService, RouteStatusEnum, RouteTypeEnum, DriverService, VehicleService } from '../../../../entities';
import { DistrictContextStore } from '../../../../shared/stores/district-context.store';

export interface CreateRouteState {
  // Form data
  formData: {
    districtId: string;
    driverId: string;
    vehicleId: string;
    routeType: RouteTypeEnum;
    scheduledDate: string; // YYYY-MM-DD
    scheduledStartTime: string; // HH:MM
    
  };

  // Available options from backend
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
    routeType: RouteTypeEnum.REGULAR,
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

export const CreateRouteStore = signalStore(
  { providedIn: 'root' },

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
          form.routeType.trim() !== '' &&
          form.scheduledDate.trim() !== '' &&
          form.scheduledStartTime.trim() !== '';
          // scheduledEndTime removed - backend calculates it
      }),

      // District context
      districtId: computed(() => districtContextStore.districtId()),
      districtName: computed(() => districtContextStore.districtName()),

      routePreview: computed((): Partial<RouteEntity> => {
        const form = state.formData();
        const districtId = districtContextStore.districtId();

        return {
          id: 'preview',
          districtId: districtId || '',
          driverId: form.driverId || null,
          vehicleId: form.vehicleId || null,
          routeType: form.routeType,
          status: RouteStatusEnum.DRAFT,
          scheduledStartAt: form.scheduledDate && form.scheduledStartTime
            ? new Date(`${form.scheduledDate}T${form.scheduledStartTime}`)
            : new Date(),
          scheduledEndAt: new Date(), // Backend calculates this
          startedAt: null,
          completedAt: null,
          waypoints: [],
          totalDistance: null,
          estimatedDuration: null,
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

          console.log('🚗 All vehicles from backend:', vehicles);
          console.log('📍 Current districtId:', districtId);
          console.log('🔍 Vehicles in this district:', vehicles.filter((v: any) => v.districtId === districtId));

          // Filter only available/active items for the current district
          const availableDrivers = drivers.filter((d: any) =>
            d.districtId === districtId &&
            (d.status === 'available' || d.status === 'AVAILABLE')
          );

          // Vehicles use isActive (boolean) instead of status
          const availableVehicles = vehicles.filter((v: any) =>
            v.districtId === districtId &&
            v.isActive === true
          );

          console.log('✅ Available drivers:', availableDrivers);
          console.log('✅ Available vehicles:', availableVehicles);
          console.log('🔍 Vehicle isActive flags:', vehicles.map((v: any) => ({ id: v.id, isActive: v.isActive, district: v.districtId })));

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
          // Combine date and time into valid Date object
          const scheduledStartAt = new Date(`${formData.scheduledDate}T${formData.scheduledStartTime}`);

          // Validate that date is valid
          if (isNaN(scheduledStartAt.getTime())) {
            patchState(store, {
              isLoading: false,
              error: 'La fecha u hora programada no es válida'
            });
            return;
          }

          // Create route entity from form data
          // Note: scheduledEndAt will be calculated by backend
          const routeEntity: RouteEntity = {
            id: '', // Will be generated by backend
            districtId: districtId,
            driverId: formData.driverId || null,
            vehicleId: formData.vehicleId || null,
            routeType: formData.routeType,
            status: RouteStatusEnum.DRAFT,
            scheduledStartAt,
            scheduledEndAt: new Date(), // Placeholder, backend will calculate actual value
            startedAt: null,
            completedAt: null,
            waypoints: [],
            totalDistance: null,
            estimatedDuration: null,
            actualDuration: null,
            currentLatitude: null,
            currentLongitude: null,
            lastLocationUpdate: null,
            createdAt: null,
            updatedAt: null
          };

          console.log('🚀 Creating route with entity:', routeEntity);
          console.log('📅 scheduledStartAt:', scheduledStartAt);
          console.log('📅 scheduledStartAt ISO (sent to backend):', scheduledStartAt.toISOString());

          routeService.create(routeEntity).subscribe({
            next: () => {
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
              console.error('Error creating route:', error);
              patchState(store, {
                isLoading: false,
                error: error?.error?.message || 'Error al crear la ruta. Por favor intente nuevamente.'
              });
            }
          });
        } catch (error) {
          console.error('Unexpected error:', error);
          patchState(store, {
            isLoading: false,
            error: 'Error inesperado al crear la ruta'
          });
        }
      }
    };
  })
);

