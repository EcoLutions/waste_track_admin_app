export interface DistrictResponse {
  id: string | null;
  name: string | null;
  code: string | null;
  boundaries: string | null;
  operationalStatus: string | null;
  serviceStartDate: string | null; // LocalDate → ISO string
  subscriptionId: string | null;
  maxVehicles: number | null;
  maxDrivers: number | null;
  maxContainers: number | null;
  primaryAdminEmail: string | null;
  createdAt: string | null; // LocalDateTime → ISO string
  updatedAt: string | null; // LocalDateTime → ISO string
}
