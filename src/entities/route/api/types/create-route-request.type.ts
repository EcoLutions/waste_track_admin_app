export interface CreateRouteRequest {
  districtId: string | null;
  vehicleId: string | null;
  driverId: string | null;
  routeType: string | null;
  scheduledDate: string | null; // LocalDate → ISO string
}

