export interface DistrictResponse {
  id: string | null;
  name: string | null;
  code: string | null;
  depotLatitud: string | null;
  depotLongitude: string | null;
  operationalStatus: string | null;
  serviceStartDate: string | null; // LocalDate → ISO string
  operationStartTime: string | null; // 'HH:mm:ss'
  operationEndTime: string | null; // 'HH:mm:ss'
  maxRouteDuration: string | null; // 'PT2H30M' o similar
  planId: string | null;
  planName: string | null;
  maxVehicles: number | null;
  maxDrivers: number | null;
  maxContainers: number | null;
  currency: string | null;
  price: string | null;
  billingPeriod: string | null;
  currentVehicleCount: number | null;
  currentDriverCount: number | null;
  currentContainerCount: number | null;
  createdAt: string | null; // LocalDateTime → ISO string
  updatedAt: string | null; // LocalDateTime → ISO string
}
