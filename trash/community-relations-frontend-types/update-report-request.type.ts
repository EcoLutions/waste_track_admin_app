/**
 * Request DTO for updating a report
 * Corresponds to: UpdateReportResource.java
 *
 * @see UpdateReportResource.java in backend
 */
export interface UpdateReportRequest {
  reportId: string | null;
  latitude: string | null;
  longitude: string | null;
  address: string | null;
  districtCode: string | null;
  containerId: string | null;
  reportType: string | null;
  description: string | null;
  resolutionNote: string | null;
}