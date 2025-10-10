/**
 * Request DTO for creating a new report
 * Corresponds to: CreateReportResource.java
 *
 * @see CreateReportResource.java in backend
 */
export interface CreateReportRequest {
  citizenId: string | null;
  latitude: string | null;
  longitude: string | null;
  address: string | null;
  districtCode: string | null;
  containerId: string | null; // Optional
  reportType: string | null;
  description: string | null;
  evidenceIds: string[] | null;
}