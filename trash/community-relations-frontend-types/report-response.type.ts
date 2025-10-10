/**
 * Response DTO for report data
 * Corresponds to: ReportResource.java
 *
 * @see ReportResource.java in backend
 */
export interface ReportResponse {
  id: string | null;
  citizenId: string | null;
  latitude: string | null;
  longitude: string | null;
  address: string | null;
  districtCode: string | null;
  containerId: string | null;
  reportType: string | null;
  description: string | null;
  status: string | null;
  resolutionNote: string | null;
  resolvedAt: string | null; // LocalDateTime → ISO string
  resolvedBy: string | null;
  submittedAt: string | null; // LocalDateTime → ISO string
  acknowledgedAt: string | null; // LocalDateTime → ISO string
  createdAt: string | null; // LocalDateTime → ISO string
  updatedAt: string | null; // LocalDateTime → ISO string
}