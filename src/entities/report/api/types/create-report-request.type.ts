
export interface CreateReportRequest {
  citizenId: string | null;
  districtId: string | null;
  latitude: string | null;
  longitude: string | null;
  containerId: string | null; // Optional
  reportType: string | null;
  description: string | null;
  evidenceIds: string[] | null;
}
