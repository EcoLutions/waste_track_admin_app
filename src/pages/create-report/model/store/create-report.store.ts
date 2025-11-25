import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { computed, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import {
  ReportService,
  CreateReportRequest,
  ReportTypeEnum,
  EvidenceService,
  EvidenceEntity
} from '../../../../entities';
import { DistrictContextStore } from '../../../../shared/stores/district-context.store';
import { AuthStore } from '../../../../shared';

export interface CreateReportState {
  latitude: number | null;
  longitude: number | null;
  containerId: string | null;
  reportType: ReportTypeEnum | null;
  description: string;

  evidences: EvidenceEntity[];
  uploadingFiles: boolean;

  isSubmitting: boolean;
  error: string | null;
  success: boolean;
}

const initialState: CreateReportState = {
  latitude: null,
  longitude: null,
  containerId: null,
  reportType: null,
  description: '',
  evidences: [],
  uploadingFiles: false,
  isSubmitting: false,
  error: null,
  success: false
};

export const CreateReportStore = signalStore(

  withState(initialState),

  withComputed((state) => ({
    isValid: computed(() => {
      return (
        state.latitude() !== null &&
        state.longitude() !== null &&
        state.reportType() !== null &&
        state.description().trim().length > 0
      );
    }),

    locationStatus: computed(() => {
      if (state.containerId()) {
        return `Contenedor #${state.containerId()!.substring(0, 6)} seleccionado`;
      }
      if (state.latitude() && state.longitude()) {
        return `Coordenadas: ${state.latitude()?.toFixed(4)}, ${state.longitude()?.toFixed(4)}`;
      }
      return 'Selecciona una ubicación en el mapa';
    }),
    evidenceIds: computed(() => state.evidences().map(e => e.id))

  })),

  withMethods((store) => {
    const reportService = inject(ReportService);
    const evidenceService = inject(EvidenceService);
    const districtStore = inject(DistrictContextStore);
    const authStore = inject(AuthStore);

    return {
      setCoordinates(lat: number, lng: number): void {
        patchState(store, {
          latitude: lat,
          longitude: lng,
          containerId: null,
          error: null
        });
      },

      setContainer(containerId: string, lat: number, lng: number): void {
        patchState(store, {
          containerId: containerId,
          latitude: lat,
          longitude: lng,
          error: null
        });
      },

      setType(type: ReportTypeEnum): void {
        patchState(store, { reportType: type });
      },

      setDescription(description: string): void {
        patchState(store, { description });
      },


      async uploadEvidence(file: File): Promise<void> {
        patchState(store, { uploadingFiles: true, error: null });
        let objectUrl: string | null = null;

        try {
          objectUrl = URL.createObjectURL(file);

          const uploadedEvidence = await firstValueFrom(evidenceService.uploadFile(file));
          uploadedEvidence.fileUrl = objectUrl;

          patchState(store, (state) => ({
            evidences: [...state.evidences, uploadedEvidence],
            uploadingFiles: false
          }));
        } catch (e) {
          console.error(e);
          if (objectUrl) {
            try { URL.revokeObjectURL(objectUrl); } catch {}
          }
          patchState(store, {
            uploadingFiles: false,
            error: 'Error al subir la imagen. Inténtalo de nuevo.'
          });
        }
      },

      removeEvidence(evidenceId: string): void {
        patchState(store, (state) => ({
          evidences: state.evidences.filter(e => e.id !== evidenceId)
        }));

        patchState(store, (state) => {
          const toRemove = state.evidences.find(e => e.id === evidenceId);
          if (toRemove?.fileUrl?.startsWith?.('blob:')) {
            try { URL.revokeObjectURL(toRemove.fileUrl); } catch {}
          }
          return {
            evidences: state.evidences.filter(e => e.id !== evidenceId)
          };
        });

      },


      async submitReport(): Promise<void> {
        if (store.isSubmitting()) return;

        const districtId = districtStore.districtId();

        if (!districtId) {
          patchState(store, { error: 'No se identificó el distrito activo.' });
          return;
        }

        const reporterId = authStore.userId();

        if (!reporterId) {
          patchState(store, { error: 'No se pudo identificar al usuario reportante.' });
          return;
        }

        if (!store.isValid()) {
          patchState(store, { error: 'Por favor complete todos los campos requeridos.' });
          return;
        }

        patchState(store, { isSubmitting: true, error: null });

        try {
          const request: CreateReportRequest = {
            citizenId: reporterId,
            districtId: districtId,
            latitude: store.latitude()!.toString(),
            longitude: store.longitude()!.toString(),
            containerId: store.containerId(),
            reportType: store.reportType()!.toString(),
            description: store.description(),
            evidenceIds: store.evidenceIds().length > 0 ? store.evidenceIds() : null

          };

          await firstValueFrom(reportService.create(request as any));

          patchState(store, {
            isSubmitting: false,
            success: true
          });
        } catch (error: any) {
          console.error('Error creating report:', error);
          patchState(store, {
            isSubmitting: false,
            error: error.message || 'Ocurrió un error al crear el reporte.'
          });
        }
      },

      reset(): void {
        patchState(store, initialState);
      }
    };
  })
);
