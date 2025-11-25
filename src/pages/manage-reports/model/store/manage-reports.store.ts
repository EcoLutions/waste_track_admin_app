import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { computed, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import {EvidenceEntity, ReportEntity, ReportService, ReportStatusEnum} from '../../../../entities';


export interface ManageReportsState {
  currentReport: ReportEntity | null;
  evidences: EvidenceEntity[];
  isLoadingEvidences: boolean;
  isSaving: boolean;
  error: string | null;
}

const initialState: ManageReportsState = {
  currentReport: null,
  evidences: [],
  isLoadingEvidences: false,
  isSaving: false,
  error: null
};

export const ManageReportsStore = signalStore(
  withState(initialState),

  withComputed((state) => ({
    hasEvidences: computed(() => state.evidences().length > 0),
    isResolved: computed(() => state.currentReport()?.status === ReportStatusEnum.RESOLVED),
    canEdit: computed(() =>
      state.currentReport() !== null &&
      state.currentReport()?.status !== ReportStatusEnum.RESOLVED &&
      state.currentReport()?.status !== ReportStatusEnum.REJECTED
    )
  })),

  withMethods((store) => {
    const reportService = inject(ReportService);

      return {
      async setReport(reportId: string): Promise<void> {
        const report = await firstValueFrom(reportService.getById(reportId));
        patchState(store, { currentReport: report, error: null });

        if (report) {
          await this.loadEvidences(report.id);
        } else {
          patchState(store, { evidences: [] });
        }
      },

      async loadEvidences(reportId: string): Promise<void> {
        patchState(store, { isLoadingEvidences: true, evidences: [] });

        try {
          const evidences = await firstValueFrom(reportService.getAllEvidencesByReportId(reportId));
          patchState(store, {
            evidences: evidences || [],
            isLoadingEvidences: false
          });
        } catch (error: any) {
          console.error('Error loading evidences:', error);
          patchState(store, {
            isLoadingEvidences: false,
          });
        }
      },

      async saveResolution(status: ReportStatusEnum, resolutionNote: string): Promise<boolean> {
        const currentReport = store.currentReport();

        if (!currentReport) {
          patchState(store, { error: 'No hay un reporte seleccionado.' });
          return false;
        }

        patchState(store, { isSaving: true, error: null });

        try {
          const updatedEntity: ReportEntity = {
            ...currentReport,
            status: status,
            resolutionNote: resolutionNote,
            resolvedAt: status === ReportStatusEnum.RESOLVED ? new Date() : currentReport.resolvedAt
          };

          const result = await firstValueFrom(reportService.update(currentReport.id, updatedEntity));

          patchState(store, {
            isSaving: false,
            currentReport: result
          });

          return true;
        } catch (error: any) {
          console.error('Error updating report:', error);
          patchState(store, {
            isSaving: false,
            error: error.message || 'Error al guardar los cambios del reporte.'
          });
          return false;
        }
      },

      resetState(): void {
        patchState(store, initialState);
      }
    };
  })
);
